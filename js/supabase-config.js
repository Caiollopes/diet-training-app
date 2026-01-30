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
// ===== FUNÇÕES DE TREINOS =====

export async function saveWorkout(phone, planName, workout) {
  console.log("Iniciando saveWorkout:", { phone, planName });

  const { data: existingDataArray, error: selectError } = await supabase
    .from("workouts")
    .select("plans")
    .eq("phone", phone);

  let plans = [];
  if (existingDataArray && existingDataArray.length > 0) {
    plans = existingDataArray[0]?.plans || [];
    console.log(
      "Dados existentes encontrados:",
      existingDataArray.length,
      "registros",
    );
  } else {
    console.log(
      "Nenhum dado existente encontrado - primeira vez que cria treino",
    );
  }

  if (selectError) {
    console.error("Erro ao buscar treinos existentes:", selectError);
  }
  console.log("Planos existentes:", plans);

  // Se é um novo plano ou atualizar existente
  const planIndex = plans.findIndex((p) => p.name === planName);

  const planData = {
    name: planName,
    exercises: workout.exercises,
    updated_at: new Date().toISOString(),
  };

  if (planIndex >= 0) {
    plans[planIndex] = planData;
    console.log("Atualizando plano existente:", planIndex);
  } else {
    plans.push(planData);
    console.log("Adicionando novo plano");
  }

  console.log("Planos a salvar:", plans);

  const { data, error } = await supabase.from("workouts").upsert(
    {
      phone,
      plans: plans,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "phone" },
  );

  if (error) {
    console.error("❌ Erro ao salvar treino:", error);
  } else {
    console.log("✅ Treino salvo com sucesso!");
    console.log("Resposta do Supabase:", data);
  }

  return { data, error };
}

export async function getWorkout(phone) {
  console.log("🔍 Buscando treinos para:", phone);

  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("phone", phone);

  if (error) {
    console.error("❌ Erro ao buscar treinos:", error);
    return { data: null, error };
  }

  // Se há dados, pegar o primeiro registro
  if (data && data.length > 0) {
    console.log("✅ Treinos encontrados:", data.length, "registros");
    console.log("Primeiro registro:", data[0]);
    return { data: data[0], error: null };
  }

  console.log("ℹ️  Nenhum treino encontrado para este usuário");
  return { data: null, error: null };
}

export async function getWorkoutPlanByName(phone, planName) {
  const { data } = await getWorkout(phone);

  if (!data || !data.plans) return null;

  return data.plans.find((p) => p.name === planName) || null;
}

// ===== DELETAR PLANOS =====
export async function deleteDietPlan(phone, planName) {
  console.log("🗑️  Deletando plano de dieta:", planName);

  const { data: existingData, error: selectError } = await supabase
    .from("diets")
    .select("plans, period_order")
    .eq("phone", phone);

  if (selectError) {
    console.error("❌ Erro ao buscar planos:", selectError);
    return { data: null, error: selectError };
  }

  if (!existingData || existingData.length === 0) {
    return { data: null, error: "Nenhum plano encontrado" };
  }

  let plans = existingData[0]?.plans || [];
  let periodOrder = existingData[0]?.period_order || [];

  // Remover o plano
  plans = plans.filter((p) => p.name !== planName);

  // Remover período se existir
  periodOrder = periodOrder.filter((p) => p !== planName);

  const { data, error } = await supabase
    .from("diets")
    .update({
      plans: plans,
      period_order: periodOrder,
      updated_at: new Date().toISOString(),
    })
    .eq("phone", phone)
    .select();

  if (error) {
    console.error("❌ Erro ao deletar plano de dieta:", error);
  } else {
    console.log("✅ Plano de dieta deletado com sucesso!");
  }

  return { data, error };
}

export async function deleteWorkoutPlan(phone, planName) {
  console.log("🗑️  Deletando plano de treino:", planName);

  const { data: existingData, error: selectError } = await supabase
    .from("workouts")
    .select("plans")
    .eq("phone", phone);

  if (selectError) {
    console.error("❌ Erro ao buscar treinos:", selectError);
    return { data: null, error: selectError };
  }

  if (!existingData || existingData.length === 0) {
    return { data: null, error: "Nenhum treino encontrado" };
  }

  let plans = existingData[0]?.plans || [];

  // Remover o plano
  plans = plans.filter((p) => p.name !== planName);

  const { data, error } = await supabase
    .from("workouts")
    .update({
      plans: plans,
      updated_at: new Date().toISOString(),
    })
    .eq("phone", phone)
    .select();

  if (error) {
    console.error("❌ Erro ao deletar plano de treino:", error);
  } else {
    console.log("✅ Plano de treino deletado com sucesso!");
  }

  return { data, error };
}
