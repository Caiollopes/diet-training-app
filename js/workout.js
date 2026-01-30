import {
  saveWorkout,
  getWorkout,
  deleteWorkoutPlan,
} from "./supabase-config.js";

let currentUser = null;
let currentWorkoutName = "";
let workoutState = {};
let isEditMode = false;
let editingExerciseKey = null;

// ===== INICIALIZAÇÃO =====
async function initialize() {
  currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  // Verificar se é modo de edição
  const editWorkoutName = localStorage.getItem("editWorkoutName");
  if (editWorkoutName) {
    isEditMode = true;
    currentWorkoutName = editWorkoutName;
    const editWorkoutData = localStorage.getItem("editWorkoutData");
    if (editWorkoutData) {
      workoutState = JSON.parse(editWorkoutData);
      console.log("🖊️  Modo de edição ativado para:", currentWorkoutName);
    }
    // Limpar localStorage
    localStorage.removeItem("editWorkoutName");
    localStorage.removeItem("editWorkoutData");
    loadEditMode();
    setupEventListeners();
    return;
  }

  // Verificar se é novo plano
  const isNewPlan = localStorage.getItem("newWorkout") === "true";

  if (!isNewPlan) {
    window.location.href = "workout-dashboard.html";
    return;
  }

  setupEventListeners();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  const savBtn = document.getElementById("savBtn");
  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");
  const addExerciseBtn = document.getElementById("addExerciseBtn");
  const workoutName = document.getElementById("workoutName");
  const exerciseReps = document.getElementById("exerciseReps");

  if (!nextBtn) {
    console.error("nextBtn não encontrado");
    return;
  }

  // Botão Próximo (Nome → Exercícios)
  nextBtn.addEventListener("click", handleNextClick);

  // Botão Voltar
  if (backBtn) {
    backBtn.addEventListener("click", handleBackClick);
  }

  // Botão Adicionar Exercício
  if (addExerciseBtn) {
    addExerciseBtn.addEventListener("click", handleAddExercise);
  }

  // Botão Salvar (cabeçalho)
  if (savBtn) {
    savBtn.addEventListener("click", handleSaveWorkout);
  }

  // Enter no input de nome
  if (workoutName) {
    workoutName.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleNextClick();
    });
  }

  // Enter no input de reps
  if (exerciseReps) {
    exerciseReps.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleAddExercise();
    });
  }
}

// ===== CARREGAR MODO DE EDIÇÃO =====
function loadEditMode() {
  // Pular para a seção de exercícios
  document.getElementById("workoutNameSection").style.display = "none";
  document.getElementById("workoutExercisesSection").style.display = "block";

  // Preencher o nome do treino (oculto)
  document.getElementById("workoutName").value = currentWorkoutName;

  // Mostrar o nome do treino no título
  document.getElementById("workoutTitleDisplay").textContent =
    currentWorkoutName;

  // Renderizar exercícios já salvos
  renderExercisesList();

  // Alterar texto do botão para "Atualizar Treino"
  const savBtn = document.getElementById("savBtn");
  if (savBtn) {
    savBtn.innerHTML = '<i class="fas fa-save"></i> Atualizar Treino';
  }

  // Mostrar botão de deletar
  const deleteBtn = document.getElementById("deleteBtn");
  if (deleteBtn) {
    deleteBtn.style.display = "inline-flex";
    deleteBtn.addEventListener("click", handleDeleteWorkout);
  }

  console.log(
    "✅ Modo de edição carregado com",
    Object.keys(workoutState).length,
    "exercícios",
  );
}

// ===== MANIPULADORES DE EVENTOS =====
function handleNextClick() {
  const name = document.getElementById("workoutName").value.trim();

  if (!name) {
    alert("Digite um nome para o treino");
    return;
  }

  currentWorkoutName = name;
  workoutState = {};

  // Mostrar seção de exercícios
  document.getElementById("workoutNameSection").style.display = "none";
  document.getElementById("workoutExercisesSection").style.display = "block";
  document.getElementById("workoutTitleDisplay").textContent = name;

  // Limpar inputs
  document.getElementById("exerciseName").value = "";
  document.getElementById("exerciseReps").value = "";
  document.getElementById("exerciseName").focus();

  renderExercisesList();
}

function handleBackClick() {
  // Se estiver em modo de edição, voltar para o user-home
  if (isEditMode) {
    window.location.href = "user-home.html";
    return;
  }

  document.getElementById("workoutNameSection").style.display = "block";
  document.getElementById("workoutExercisesSection").style.display = "none";
}

function handleAddExercise() {
  const name = document.getElementById("exerciseName").value.trim();
  const reps = document.getElementById("exerciseReps").value.trim();

  if (!name || !reps) {
    alert("Preencha o nome e as repetições do exercício");
    return;
  }

  const exerciseKey = Date.now().toString();
  workoutState[exerciseKey] = { name, reps };

  // Limpar inputs
  document.getElementById("exerciseName").value = "";
  document.getElementById("exerciseReps").value = "";
  document.getElementById("exerciseName").focus();

  renderExercisesList();
}

async function handleDeleteWorkout() {
  if (!isEditMode || !currentWorkoutName) {
    alert("Nenhum treino para deletar");
    return;
  }

  if (
    !confirm(
      `Tem certeza que deseja deletar o treino "${currentWorkoutName}"?\n\nEsta ação não pode ser desfeita.`,
    )
  ) {
    return;
  }

  try {
    const deleteBtn = document.getElementById("deleteBtn");
    deleteBtn.disabled = true;
    deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deletando...';

    const { error } = await deleteWorkoutPlan(currentUser, currentWorkoutName);

    if (error) {
      alert("Erro ao deletar treino");
      deleteBtn.disabled = false;
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Deletar Treino';
      return;
    }

    console.log("✅ Treino deletado com sucesso!");

    // Voltar para user-home
    window.location.href = "user-home.html";
  } catch (error) {
    console.error("Erro ao deletar treino:", error);
    alert("Erro ao deletar treino");
    const deleteBtn = document.getElementById("deleteBtn");
    deleteBtn.disabled = false;
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Deletar Treino';
  }
}

async function handleSaveWorkout() {
  // Usar o currentWorkoutName se estiver na seção de exercícios, senão usar o input
  let workoutName =
    currentWorkoutName || document.getElementById("workoutName").value.trim();

  if (!workoutName) {
    alert("Digite um nome para o treino");
    return;
  }

  if (Object.keys(workoutState).length === 0) {
    alert("Adicione pelo menos um exercício");
    return;
  }

  try {
    const savBtn = document.getElementById("savBtn");
    savBtn.disabled = true;
    const buttonText = isEditMode ? "Atualizando..." : "Salvando...";
    savBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${buttonText}`;

    const workoutData = {
      name: workoutName,
      exercises: workoutState,
      createdAt: new Date().toISOString(),
    };

    console.log(
      isEditMode ? "🖊️  Atualizando treino:" : "💾 Salvando treino:",
      { currentUser, workoutName, workoutData },
    );

    await saveWorkout(currentUser, workoutName, workoutData);

    const successMsg = isEditMode
      ? "✅ Treino atualizado com sucesso!"
      : "✅ Treino salvo com sucesso!";
    console.log(successMsg);

    // Limpar flags
    localStorage.removeItem("newWorkout");

    // Redirecionar com delay maior para garantir sincronização
    setTimeout(() => {
      console.log("🔄 Redirecionando para workout-dashboard...");
      window.location.href = "workout-dashboard.html";
    }, 1200);
  } catch (error) {
    console.error("Erro ao salvar treino:", error);
    alert("Erro ao salvar treino. Tente novamente.");
    const savBtn = document.getElementById("savBtn");
    savBtn.disabled = false;
    const buttonText = isEditMode ? "Atualizar Treino" : "Salvar Treino";
    savBtn.innerHTML = `<i class="fas fa-save"></i> ${buttonText}`;
  }
}

// ===== RENDERIZAÇÃO =====
function renderExercisesList() {
  const container = document.getElementById("exercisesList");
  container.innerHTML = "";

  Object.entries(workoutState).forEach(([key, exercise]) => {
    const isEditing = editingExerciseKey === key;
    const card = document.createElement("div");
    card.className = "exercise-card";

    if (isEditing) {
      // Modo de edição
      card.innerHTML = `
        <div class="exercise-edit-form">
          <div class="form-group">
            <label for="editExerciseName-${key}">Nome do Exercício:</label>
            <input
              type="text"
              id="editExerciseName-${key}"
              class="form-input"
              value="${exercise.name}"
              placeholder="Ex: Flexão"
            />
          </div>
          <div class="form-group">
            <label for="editExerciseReps-${key}">Séries x Repetições:</label>
            <input
              type="text"
              id="editExerciseReps-${key}"
              class="form-input"
              value="${exercise.reps}"
              placeholder="Ex: 3x10"
            />
          </div>
          <div class="form-actions">
            <button class="btn-save" type="button" onclick="saveEditExercise('${key}')">
              <i class="fas fa-check"></i> Salvar
            </button>
            <button class="btn-cancel" type="button" onclick="cancelEditExercise()">
              <i class="fas fa-times"></i> Cancelar
            </button>
          </div>
        </div>
      `;
    } else {
      // Modo de visualização
      card.innerHTML = `
        <div class="exercise-header">
          <div class="exercise-info">
            <h3 class="exercise-name">${exercise.name}</h3>
            <p class="exercise-reps">${exercise.reps}</p>
          </div>
          <div class="exercise-actions">
            <button class="btn-edit" type="button" onclick="startEditExercise('${key}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-remove" type="button" onclick="deleteExercise('${key}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    }

    container.appendChild(card);
  });
}

// ===== FUNÇÕES GLOBAIS =====
window.startEditExercise = function (key) {
  editingExerciseKey = key;
  renderExercisesList();
  // Focus no primeiro input
  setTimeout(() => {
    const input = document.getElementById(`editExerciseName-${key}`);
    if (input) input.focus();
  }, 0);
};

window.saveEditExercise = function (key) {
  const newName = document
    .getElementById(`editExerciseName-${key}`)
    .value.trim();
  const newReps = document
    .getElementById(`editExerciseReps-${key}`)
    .value.trim();

  if (!newName || !newReps) {
    alert("Preencha nome e séries/repetições");
    return;
  }

  workoutState[key] = { name: newName, reps: newReps };
  editingExerciseKey = null;
  renderExercisesList();
  console.log("✅ Exercício atualizado:", {
    key,
    name: newName,
    reps: newReps,
  });
};

window.cancelEditExercise = function () {
  editingExerciseKey = null;
  renderExercisesList();
};

window.deleteExercise = function (key) {
  if (confirm("Remover este exercício?")) {
    delete workoutState[key];
    renderExercisesList();
  }
};

// Inicializar
initialize();
