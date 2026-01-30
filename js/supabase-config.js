// ⚙️ CONFIGURAÇÃO SUPABASE
// Carrega de variáveis de ambiente ou valores padrão

const SUPABASE_URL =
  typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL
    ? process.env.VITE_SUPABASE_URL
    : window.__SUPABASE_URL__ || "https://ykyxuuvixcbqktpbgqol.supabase.co";

const SUPABASE_ANON_KEY =
  typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY
    ? process.env.VITE_SUPABASE_ANON_KEY
    : window.__SUPABASE_ANON_KEY__ ||
      "sb_publishable_ta9hxW8-jAdjXDSIJQJDAg_CseHtViS";

// Importar cliente Supabase (via CDN)
const { createClient } = window.supabase;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Funções auxiliares
export async function getUserByPhone(phone) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .single();

  return { data, error };
}

export async function createUser(name, phone) {
  const { data, error } = await supabase
    .from("users")
    .insert([{ name, phone }])
    .select()
    .single();

  return { data, error };
}

export async function saveDiet(phone, planName, diet, periods) {
  const { data: existingData } = await supabase
    .from("diets")
    .select("plans")
    .eq("phone", phone)
    .single();

  let plans = existingData?.plans || [];

  // Se é um novo plano ou atualizar existente
  const planIndex = plans.findIndex((p) => p.name === planName);

  const planData = {
    name: planName,
    diet_data: diet,
    period_order: periods,
    updated_at: new Date().toISOString(),
  };

  if (planIndex >= 0) {
    plans[planIndex] = planData;
  } else {
    plans.push(planData);
  }

  const { data, error } = await supabase.from("diets").upsert(
    {
      phone,
      plans: plans,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "phone" },
  );

  if (error) {
    console.error("Erro ao salvar dieta:", error);
  } else {
    console.log("Dieta salva com sucesso:", data);
  }

  return { data, error };
}

export async function getDiet(phone) {
  const { data, error } = await supabase
    .from("diets")
    .select("*")
    .eq("phone", phone)
    .single();

  return { data, error };
}

export async function getPlanByName(phone, planName) {
  const { data } = await getDiet(phone);

  if (!data || !data.plans) return null;

  return data.plans.find((p) => p.name === planName) || null;
}
