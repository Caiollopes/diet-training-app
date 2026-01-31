import { getUserByPhone, getWorkout, supabase } from "./supabase-config.js";

const phone = localStorage.getItem("currentUser");
if (!phone) window.location.href = "index.html";

// Carregar dados do usuário
loadUserData();

async function loadUserData() {
  const { data: user } = await getUserByPhone(phone);

  if (user) {
    document.getElementById("userName").textContent = `Olá, ${user.name}!`;
  }

  // === TREINOS ===
  const { data: workout } = await getWorkout(phone);
  const hasWorkouts = workout && workout.plans && workout.plans.length > 0;

  // Atualizar contador de treinos
  const workoutCount = hasWorkouts ? workout.plans.length : 0;
  document.getElementById("workoutCount").textContent = workoutCount;

  // Obter botão de visualizar treinos
  const viewWorkoutBtn = document.querySelector(
    '.main-action-card[href="workout-dashboard.html"]',
  );

  if (!hasWorkouts && viewWorkoutBtn) {
    // Desabilitar botão de visualizar treinos
    viewWorkoutBtn.style.opacity = "0.5";
    viewWorkoutBtn.style.pointerEvents = "none";
    viewWorkoutBtn.style.cursor = "not-allowed";
    viewWorkoutBtn.title = "Crie um treino primeiro";
  }

  // === DIETAS ===
  try {
    const { data: dietData, error } = await supabase
      .from("diets")
      .select("plans")
      .eq("phone", phone)
      .single();

    const dietCount =
      !error && dietData && dietData.plans ? dietData.plans.length : 0;
    document.getElementById("dietCount").textContent = dietCount;

    // Verificar se tem dietas para habilitar/desabilitar botão
    const viewDietBtn = document.querySelector(
      '.main-action-card[href="diet-dashboard.html"]',
    );

    if (dietCount === 0 && viewDietBtn) {
      viewDietBtn.style.opacity = "0.5";
      viewDietBtn.style.pointerEvents = "none";
      viewDietBtn.style.cursor = "not-allowed";
      viewDietBtn.title = "Crie uma dieta primeiro";
    }
  } catch (error) {
    console.error("Erro ao buscar dietas:", error);
    document.getElementById("dietCount").textContent = "0";
  }

  // === DIAS DE TREINO E SEQUÊNCIA ===
  const calendarData = localStorage.getItem(`workout_calendar_${phone}`);
  if (calendarData) {
    const markedDates = JSON.parse(calendarData);
    const trainingDays = markedDates.length;
    document.getElementById("trainingDays").textContent = trainingDays;

    // Calcular sequência (dias consecutivos)
    if (markedDates.length > 0) {
      const sortedDates = markedDates
        .map((d) => new Date(d))
        .sort((a, b) => b - a);

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Verificar se treinou hoje ou ontem para começar a contar
      const lastTraining = new Date(sortedDates[0]);
      lastTraining.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor(
        (today - lastTraining) / (1000 * 60 * 60 * 24),
      );

      // Se treinou hoje ou ontem, começar a contar sequência
      if (daysDiff <= 1) {
        streak = 1; // Conta o último treino

        for (let i = 1; i < sortedDates.length; i++) {
          const current = new Date(sortedDates[i]);
          current.setHours(0, 0, 0, 0);
          const previous = new Date(sortedDates[i - 1]);
          previous.setHours(0, 0, 0, 0);
          const diff = Math.floor((previous - current) / (1000 * 60 * 60 * 24));

          if (diff === 1) {
            streak++;
          } else {
            break;
          }
        }
      }

      document.getElementById("streakDays").textContent = streak;
    }
  } else {
    // Se não tem dados de calendário, zerar contadores
    document.getElementById("trainingDays").textContent = "0";
    document.getElementById("streakDays").textContent = "0";
  }
}

// Logout
document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
};
