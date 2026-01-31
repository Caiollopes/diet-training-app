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

// ===== FUNÇÕES DE DIETAS (NOVO SISTEMA COM AUTH) =====

export async function createDiet(userId, dietName, meals) {
  try {
    // Criar a dieta
    const { data: diet, error: dietError } = await supabase
      .from("diets")
      .insert({
        user_id: userId,
        name: dietName,
      })
      .select()
      .single();

    if (dietError) throw dietError;

    // Inserir as refeições
    if (meals && meals.length > 0) {
      const mealsToInsert = meals.map((meal) => ({
        diet_id: diet.id,
        name: meal.name,
        time: meal.time || null,
        foods: meal.foods,
      }));

      const { error: mealsError } = await supabase
        .from("diet_meals")
        .insert(mealsToInsert);

      if (mealsError) throw mealsError;
    }

    console.log("✅ Dieta criada com sucesso:", diet);
    return { data: diet, error: null };
  } catch (error) {
    console.error("❌ Erro ao criar dieta:", error);
    return { data: null, error };
  }
}

export async function updateDiet(dietId, dietName, meals) {
  try {
    // Atualizar o nome da dieta
    const { error: updateError } = await supabase
      .from("diets")
      .update({
        name: dietName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", dietId);

    if (updateError) throw updateError;

    // Deletar refeições antigas
    const { error: deleteError } = await supabase
      .from("diet_meals")
      .delete()
      .eq("diet_id", dietId);

    if (deleteError) throw deleteError;

    // Inserir novas refeições
    if (meals && meals.length > 0) {
      const mealsToInsert = meals.map((meal) => ({
        diet_id: dietId,
        name: meal.name,
        time: meal.time || null,
        foods: meal.foods,
      }));

      const { error: insertError } = await supabase
        .from("diet_meals")
        .insert(mealsToInsert);

      if (insertError) throw insertError;
    }

    console.log("✅ Dieta atualizada com sucesso!");
    return { data: true, error: null };
  } catch (error) {
    console.error("❌ Erro ao atualizar dieta:", error);
    return { data: null, error };
  }
}

export async function deleteDiet(dietId) {
  try {
    // Deletar refeições primeiro (cascade deve fazer isso automaticamente, mas garantimos)
    const { error: mealsError } = await supabase
      .from("diet_meals")
      .delete()
      .eq("diet_id", dietId);

    if (mealsError) throw mealsError;

    // Deletar a dieta
    const { error: dietError } = await supabase
      .from("diets")
      .delete()
      .eq("id", dietId);

    if (dietError) throw dietError;

    console.log("✅ Dieta deletada com sucesso!");
    return { data: true, error: null };
  } catch (error) {
    console.error("❌ Erro ao deletar dieta:", error);
    return { data: null, error };
  }
}

export async function getDietsByUserId(userId) {
  try {
    const { data, error } = await supabase
      .from("diets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("❌ Erro ao buscar dietas:", error);
    return { data: null, error };
  }
}

export async function getDietById(dietId) {
  try {
    const { data: diet, error: dietError } = await supabase
      .from("diets")
      .select("*")
      .eq("id", dietId)
      .single();

    if (dietError) throw dietError;

    const { data: meals, error: mealsError } = await supabase
      .from("diet_meals")
      .select("*")
      .eq("diet_id", dietId)
      .order("created_at", { ascending: true });

    if (mealsError) throw mealsError;

    return { data: { diet, meals }, error: null };
  } catch (error) {
    console.error("❌ Erro ao buscar dieta:", error);
    return { data: null, error };
  }
}

export async function getMealsByDietId(dietId) {
  try {
    const { data, error } = await supabase
      .from("diet_meals")
      .select("*")
      .eq("diet_id", dietId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("❌ Erro ao buscar refeições:", error);
    return { data: null, error };
  }
}

// Exportar também a configuração para uso direto
export const supabaseConfig = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,
};
