import { getWorkout, getUserByPhone } from "./supabase-config.js";

let currentUser = null;
let allWorkouts = [];
let currentPlan = null;
let userData = null;

// ===== INICIALIZAÇÃO =====
async function initialize() {
  currentUser = localStorage.getItem("currentUser");
  console.log("🚀 Inicializando workout-dashboard para usuário:", currentUser);

  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  setupEventListeners();
  await loadUserData();
  await loadData();
}

// ===== CARREGAR DADOS DO USUÁRIO =====
async function loadUserData() {
  try {
    const { data: user } = await getUserByPhone(currentUser);
    userData = user;

    if (userData) {
      document.getElementById("username").textContent =
        `Treinos de ${userData.name}`;
    }
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error);
  }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  const newWorkoutBtn = document.getElementById("newWorkoutBtn");
  if (newWorkoutBtn) {
    newWorkoutBtn.addEventListener("click", () => {
      localStorage.setItem("newWorkout", "true");
      window.location.href = "workout.html";
    });
  }

  const workoutPlanSelect = document.getElementById("workoutPlanSelect");
  if (workoutPlanSelect) {
    workoutPlanSelect.addEventListener("change", (e) => {
      currentPlan = e.target.value;
      renderWorkoutContent();
    });
  }

  // Botão de baixar PDF
  const downloadPDF = document.getElementById("downloadPDF");
  if (downloadPDF) {
    downloadPDF.addEventListener("click", handleDownloadPDF);
  }
}

// ===== CARREGAR DADOS =====
async function loadData(retryCount = 0) {
  try {
    console.log(`📊 Tentativa ${retryCount + 1} de carregamento de treinos...`);
    const { data: workoutData, error } = await getWorkout(currentUser);

    if (error) {
      console.error("❌ Erro do Supabase:", error);
      throw error;
    }

    if (workoutData && workoutData.plans && Array.isArray(workoutData.plans)) {
      allWorkouts = workoutData.plans;
      console.log(
        `✅ ${allWorkouts.length} treino(s) carregado(s):`,
        allWorkouts.map((w) => w.name),
      );
    } else {
      allWorkouts = [];
      console.log("ℹ️  Nenhum treino encontrado");
    }

    renderDashboard();
  } catch (error) {
    console.error("❌ Erro ao carregar treinos:", error);

    if (retryCount < 5) {
      const delay = 300 + retryCount * 200;
      console.log(`⏳ Tentando novamente em ${delay}ms...`);
      setTimeout(() => loadData(retryCount + 1), delay);
    } else {
      console.error("❌ Máximo de tentativas atingido!");
      alert("Erro ao carregar treinos. Tente novamente.");
    }
  }
}

// ===== RENDERIZAÇÃO DO DASHBOARD =====
function renderDashboard() {
  if (allWorkouts.length === 0) {
    document.getElementById("planSelector").style.display = "none";
    document.getElementById("workoutView").innerHTML = "";
    document.getElementById("emptyState").style.display = "block";
    document.getElementById("downloadPDF").style.display = "none";
  } else {
    document.getElementById("emptyState").style.display = "none";
    document.getElementById("planSelector").style.display = "flex";
    document.getElementById("downloadPDF").style.display = "inline-flex";

    // Renderizar seletor de planos
    const select = document.getElementById("workoutPlanSelect");
    select.innerHTML = '<option value="">Selecione um treino...</option>';

    allWorkouts.forEach((workout, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = workout.name;
      select.appendChild(option);
    });

    if (!currentPlan) {
      document.getElementById("workoutView").innerHTML = "";
    } else {
      renderWorkoutContent();
    }
  }
}

// ===== RENDERIZAR CONTEÚDO DO TREINO =====
function renderWorkoutContent() {
  const index = parseInt(currentPlan);

  if (isNaN(index) || !allWorkouts[index]) {
    document.getElementById("workoutView").innerHTML = "";
    return;
  }

  const workout = allWorkouts[index];
  let html = `
    <div id="workoutPDFContent">
      <div class="exercises-list">
  `;

  if (workout.exercises && Object.keys(workout.exercises).length > 0) {
    Object.entries(workout.exercises).forEach(([key, exercise]) => {
      html += `
        <div class="exercise-card">
          <div class="exercise-header">
            <div class="exercise-info">
              <h3 class="exercise-name">${exercise.name}</h3>
              <p class="exercise-reps">${exercise.reps}</p>
            </div>
          </div>
        </div>
      `;
    });
  } else {
    html +=
      '<p style="text-align: center; color: var(--text-secondary);">Nenhum exercício cadastrado</p>';
  }

  html += "</div></div>";

  // Adicionar botão de editar
  html += `
    <div class="workout-actions">
      <button id="editWorkoutBtn" class="btn-primary">
        <i class="fas fa-edit"></i>
        Editar Treino
      </button>
    </div>
  `;

  document.getElementById("workoutView").innerHTML = html;

  // Adicionar event listener ao botão de editar
  const editBtn = document.getElementById("editWorkoutBtn");
  if (editBtn) {
    editBtn.addEventListener("click", handleEditWorkout);
  }
}

// ===== EDITAR TREINO =====
function handleEditWorkout() {
  if (isNaN(parseInt(currentPlan)) || !allWorkouts[parseInt(currentPlan)]) {
    alert("Selecione um treino válido");
    return;
  }

  const workout = allWorkouts[parseInt(currentPlan)];
  console.log("🖊️  Editando treino:", workout.name);

  // Salvar dados do treino a ser editado no localStorage
  localStorage.setItem("editWorkoutName", workout.name);
  localStorage.setItem("editWorkoutData", JSON.stringify(workout.exercises));

  // Redirecionar para a página de workout em modo edição
  window.location.href = "workout.html";
}

// ===== BAIXAR PDF =====
function handleDownloadPDF() {
  const index = parseInt(currentPlan);

  if (isNaN(index) || !allWorkouts[index]) {
    alert("Selecione um treino para baixar");
    return;
  }

  const workout = allWorkouts[index];
  const userName = userData?.name || "Usuário";

  // Criar conteúdo do PDF
  const element = document.createElement("div");
  element.style.padding = "20px";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.backgroundColor = "#ffffff";
  element.style.color = "#000000";

  // Cabeçalho
  let content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="margin: 0; color: #0f172a; font-size: 32px;">${workout.name}</h1>
      <p style="margin: 10px 0 0 0; color: #64748b; font-size: 14px;">Usuário: ${userName}</p>
      <p style="margin: 5px 0 0 0; color: #64748b; font-size: 12px;">Data: ${new Date().toLocaleDateString("pt-BR")}</p>
    </div>

    <div style="margin-top: 30px;">
      <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Exercícios</h2>
  `;

  if (workout.exercises && Object.keys(workout.exercises).length > 0) {
    Object.entries(workout.exercises).forEach(([key, exercise], index) => {
      content += `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; page-break-inside: avoid;">
          <p style="margin: 0 0 10px 0;"><strong style="font-size: 16px; color: #0f172a;">${index + 1}. ${exercise.name}</strong></p>
          <p style="margin: 0; color: #64748b; font-size: 14px;">Repetições: <strong>${exercise.reps}</strong></p>
        </div>
      `;
    });
  } else {
    content += '<p style="color: #64748b;">Nenhum exercício cadastrado</p>';
  }

  content += "</div>";
  element.innerHTML = content;

  // Opções do html2pdf
  const options = {
    margin: 10,
    filename: `Treino_${workout.name}_${userName}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
  };

  // Gerar PDF
  html2pdf().set(options).from(element).save();
}

// Inicializar
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
