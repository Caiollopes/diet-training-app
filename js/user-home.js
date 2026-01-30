import { getUserByPhone, getDiet, getWorkout } from "./supabase-config.js";

const phone = localStorage.getItem("currentUser");
if (!phone) window.location.href = "index.html";

// Carregar dados do usuário
loadUserData();

async function loadUserData() {
  const { data: user } = await getUserByPhone(phone);

  if (user) {
    document.getElementById("userName").textContent =
      `Bem-vindo, ${user.name}!`;
  }

  // Verificar se tem planos de dieta
  const { data: diet } = await getDiet(phone);
  const hasPlans = diet && diet.plans && diet.plans.length > 0;

  // Obter os botões
  const viewBtn = document.querySelector('.action-card[href="dashboard.html"]');

  if (!hasPlans) {
    // Desabilitar botão de visualizar
    viewBtn.style.opacity = "0.5";
    viewBtn.style.pointerEvents = "none";
    viewBtn.style.cursor = "not-allowed";

    // Adicionar tooltip
    viewBtn.title = "Crie um plano primeiro";
  }

  // Verificar se tem treinos
  const { data: workout } = await getWorkout(phone);
  const hasWorkouts = workout && workout.plans && workout.plans.length > 0;

  // Obter botão de visualizar treinos
  const viewWorkoutBtn = document.querySelector(
    '.action-card[href="workout-dashboard.html"]',
  );

  if (!hasWorkouts) {
    // Desabilitar botão de visualizar treinos
    viewWorkoutBtn.style.opacity = "0.5";
    viewWorkoutBtn.style.pointerEvents = "none";
    viewWorkoutBtn.style.cursor = "not-allowed";

    // Adicionar tooltip
    viewWorkoutBtn.title = "Crie um treino primeiro";
  }
}

// Logout
document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
};

// Criar novo plano (limpar dados atuais)
document.getElementById("createNewBtn").onclick = () => {
  localStorage.setItem("newPlan", "true");
  localStorage.removeItem("currentPlan");
  window.location.href = "diet.html";
};

// Criar novo treino
document.getElementById("createNewWorkoutBtn").onclick = () => {
  localStorage.setItem("newWorkout", "true");
  window.location.href = "workout.html";
};
