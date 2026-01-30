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

export async function saveDiet(phone, diet, periods) {
  const { data, error } = await supabase
    .from("diets")
    .upsert([
      {
        phone,
        diet_data: diet,
        period_order: periods,
        updated_at: new Date(),
      },
    ])
    .select()
    .single();

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
