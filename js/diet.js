import { saveDiet, getDiet, deleteDietPlan } from "./supabase-config.js";

const phone = localStorage.getItem("currentUser");
if (!phone) window.location.href = "index.html";

let dietState = {};
const rendered = {};
let periodOrder = null;
let editingMeal = null;
let editingPeriod = null;
let currentPlanName = "";

const buttons = document.querySelectorAll("[data-period]");
const container = document.getElementById("periodsContainer");
const saveBtn = document.getElementById("saveDiet");
const deleteBtn = document.getElementById("deleteDiet");
const dietNameInput = document.getElementById("dietNameInput");
const nextBtn = document.getElementById("nextBtn");
const dietNameSection = document.getElementById("dietNameSection");
const dietPeriodsSection = document.getElementById("dietPeriodsSection");
const dietNameDisplay = document.getElementById("dietNameDisplay");

// Mostrar skeleton loader
showSkeleton();

// Carregar dieta do Supabase
loadDiet();

function showSkeleton() {
  const container = document.getElementById("periodsContainer");
  container.innerHTML = `
    <div class="skeleton-buttons">
      <div class="skeleton skeleton-button"></div>
      <div class="skeleton skeleton-button"></div>
      <div class="skeleton skeleton-button"></div>
      <div class="skeleton skeleton-button"></div>
    </div>
  `;
}

async function loadDiet() {
  // Limpa skeleton
  document.getElementById("periodsContainer").innerHTML = "";

  const isNewPlan = localStorage.getItem("newPlan") === "true";
  const currentPlan = localStorage.getItem("currentPlan");

  if (isNewPlan) {
    // Criar novo plano vazio
    dietState = {};
    periodOrder = [];
    currentPlanName = "";
    localStorage.removeItem("newPlan");
    dietNameSection.classList.remove("hidden");
    dietPeriodsSection.classList.add("hidden");
  } else {
    // Carregar plano existente
    const { data } = await getDiet(phone);

    if (data && data.plans && data.plans.length > 0) {
      // Se tem um plano atual definido, carrega ele, senão carrega o primeiro
      const planName = currentPlan || data.plans[0].name;
      const plan = data.plans.find((p) => p.name === planName) || data.plans[0];

      localStorage.setItem("currentPlan", plan.name);
      currentPlanName = plan.name;
      dietState = plan.diet_data || {};
      periodOrder = plan.period_order || [];
      dietNameSection.classList.add("hidden");
      dietPeriodsSection.classList.remove("hidden");
      dietNameDisplay.textContent = `Editando: ${plan.name}`;

      // Mostrar botão de deletar
      deleteBtn.classList.remove("hidden");
    } else {
      dietState = {};
      periodOrder = [];
      currentPlanName = "";
      dietNameSection.classList.remove("hidden");
      dietPeriodsSection.classList.add("hidden");
    }
  }

  init();
}

function init() {
  const periods = Object.keys(dietState);

  if (periodOrder.length === 0) {
    periodOrder = periods;
  } else {
    periods.sort((a, b) => periodOrder.indexOf(a) - periodOrder.indexOf(b));
  }

  periods.forEach((period) => {
    renderPeriod(period);
    activateButton(period);
  });
  toggleSaveButton();
}

// Botão próximo do input de nome
nextBtn.onclick = () => {
  const name = dietNameInput.value.trim();
  if (!name) {
    alert("Digite um nome para seu plano!");
    return;
  }
  currentPlanName = name;
  dietNameSection.classList.add("hidden");
  dietPeriodsSection.classList.remove("hidden");
  dietNameDisplay.textContent = `Plano: ${name}`;
};

// Enter no input de nome
dietNameInput.onkeypress = (e) => {
  if (e.key === "Enter") {
    nextBtn.click();
  }
};

// Botão de editar nome da dieta
const editDietNameBtn = document.getElementById("editDietNameBtn");
if (editDietNameBtn) {
  editDietNameBtn.onclick = handleEditDietName;
}

function handleEditDietName() {
  const nameDisplay = document.getElementById("dietNameDisplay");
  const editBtn = document.getElementById("editDietNameBtn");

  // Extrair o nome atual (remover "Editando: " ou "Plano: " do texto)
  const currentText = nameDisplay.textContent;
  const currentName = currentText.replace(/^(Editando: |Plano: )/, "");

  // Criar input para edição inline
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentName;
  input.className = "diet-name-edit-input";
  input.maxLength = 50;

  // Substituir título pelo input
  nameDisplay.style.display = "none";
  editBtn.style.display = "none";
  nameDisplay.parentNode.insertBefore(input, nameDisplay);
  input.focus();
  input.select();

  // Função para salvar a edição
  const saveEdit = () => {
    const newName = input.value.trim();

    if (newName && newName !== currentName) {
      currentPlanName = newName;
      dietNameInput.value = newName;
      const prefix = currentText.startsWith("Editando: ")
        ? "Editando: "
        : "Plano: ";
      nameDisplay.textContent = prefix + newName;
      localStorage.setItem("currentPlan", newName);
      console.log("✏️ Nome da dieta alterado para:", newName);
    }

    // Restaurar título
    input.remove();
    nameDisplay.style.display = "";
    editBtn.style.display = "";
  };

  // Salvar com Enter
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      saveEdit();
    }
  });

  // Salvar ao perder o foco
  input.addEventListener("blur", saveEdit);

  // Cancelar com Esc
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      input.remove();
      nameDisplay.style.display = "";
      editBtn.style.display = "";
    }
  });
}

buttons.forEach((btn) => {
  btn.onclick = () => {
    const period = btn.dataset.period;
    const isActive = btn.classList.contains("active");

    if (isActive) {
      delete dietState[period];
      // Remove do periodOrder
      const index = periodOrder.indexOf(period);
      if (index > -1) {
        periodOrder.splice(index, 1);
      }
      if (rendered[period]) {
        container.removeChild(rendered[period]);
        delete rendered[period];
        btn.classList.remove("active");
      }
    } else {
      if (!dietState[period]) {
        dietState[period] = { time: "00:00", meals: [] };
      }

      // Adiciona ao periodOrder se não existir
      if (!periodOrder.includes(period)) {
        periodOrder.push(period);
      }

      if (!rendered[period]) {
        renderPeriod(period);
        activateButton(period);
      }
    }

    toggleSaveButton();
  };
});

function renderPeriod(period) {
  if (rendered[period]) return;

  const section = document.createElement("div");
  section.className = "period";
  section.dataset.period = period;

  section.innerHTML = `
    <div class="period-header">
      <strong>${period}</strong>
      <div class="period-controls">
        <button class="btn-move up" title="Mover para cima">↑</button>
        <button class="btn-move down" title="Mover para baixo">↓</button>
      </div>
      <input type="time" value="${dietState[period].time}">
    </div>

    <div class="meal-form">
      <input placeholder="Refeição">
      <input placeholder="Quantidade">
      <button>+</button>
    </div>

    <div class="meal-list"></div>
  `;

  const timeInput = section.querySelector("input[type='time']");
  const mealInput = section.querySelector(".meal-form input:nth-child(1)");
  const qtyInput = section.querySelector(".meal-form input:nth-child(2)");
  const addBtn = section.querySelector(".meal-form button");
  const list = section.querySelector(".meal-list");
  const upBtn = section.querySelector(".btn-move.up");
  const downBtn = section.querySelector(".btn-move.down");

  timeInput.onchange = () => {
    dietState[period].time = timeInput.value;
  };

  dietState[period].meals.forEach((meal) =>
    renderMeal(list, period, meal, mealInput, qtyInput, addBtn),
  );

  addBtn.onclick = () => {
    if (!mealInput.value || !qtyInput.value) return;

    if (editingMeal && editingPeriod === period) {
      editingMeal.meal = mealInput.value;
      editingMeal.qty = qtyInput.value;

      const items = list.querySelectorAll(".meal-item");
      items.forEach((item) => {
        const text = item.querySelector(".meal-text").textContent;
        if (text === editingMeal.meal || text.includes(editingMeal.meal)) {
          item.querySelector(".meal-text").textContent = editingMeal.meal;
          item.querySelector(".meal-qty").textContent = editingMeal.qty;
        }
      });

      editingMeal = null;
      editingPeriod = null;
      addBtn.textContent = "+";
      addBtn.classList.remove("btn-save-mode");
    } else {
      const meal = { meal: mealInput.value, qty: qtyInput.value };
      dietState[period].meals.push(meal);
      renderMeal(list, period, meal, mealInput, qtyInput, addBtn);
    }

    mealInput.value = "";
    qtyInput.value = "";
  };

  upBtn.onclick = () => {
    movePeriod(period, -1);
  };

  downBtn.onclick = () => {
    movePeriod(period, 1);
  };

  container.appendChild(section);
  rendered[period] = section;
}

function renderMeal(container, period, meal, mealInput, qtyInput, addBtn) {
  const item = document.createElement("div");
  item.className = "meal-item";

  item.innerHTML = `
    <div class="meal-content">
      <span class="meal-text">${meal.meal}</span>
      <span class="meal-qty">${meal.qty}</span>
    </div>
    <div class="meal-buttons">
      <button class="btn-edit" title="Editar"><i class="fas fa-edit"></i></button>
      <button class="btn-delete" title="Excluir"><i class="fas fa-trash"></i></button>
    </div>
  `;

  const editBtn = item.querySelector(".btn-edit");
  const deleteBtn = item.querySelector(".btn-delete");

  editBtn.onclick = () => {
    editingMeal = meal;
    editingPeriod = period;
    mealInput.value = meal.meal;
    qtyInput.value = meal.qty;
    addBtn.textContent = "Salvar";
    addBtn.classList.add("btn-save-mode");
    mealInput.focus();
  };

  deleteBtn.onclick = () => {
    container.removeChild(item);
    dietState[period].meals = dietState[period].meals.filter((m) => m !== meal);
  };

  container.appendChild(item);
}

function activateButton(period) {
  const btn = [...buttons].find((b) => b.dataset.period === period);
  if (btn) btn.classList.add("active");
}

function movePeriod(period, direction) {
  const currentIndex = periodOrder.indexOf(period);
  const newIndex = currentIndex + direction;

  if (newIndex < 0 || newIndex >= periodOrder.length) return;

  [periodOrder[currentIndex], periodOrder[newIndex]] = [
    periodOrder[newIndex],
    periodOrder[currentIndex],
  ];

  const sections = [...container.querySelectorAll(".period")];
  sections.sort(
    (a, b) =>
      periodOrder.indexOf(a.dataset.period) -
      periodOrder.indexOf(b.dataset.period),
  );

  container.innerHTML = "";
  sections.forEach((section) => container.appendChild(section));
}

function toggleSaveButton() {
  saveBtn.classList.toggle("hidden", Object.keys(dietState).length === 0);
}

saveBtn.onclick = async () => {
  console.log("Salvando dieta:", dietState);
  console.log("Ordem dos períodos:", periodOrder);

  const planName = currentPlanName.trim();
  if (!planName) {
    alert("Nome do plano é obrigatório!");
    return;
  }

  localStorage.setItem("currentPlan", planName);
  const { error } = await saveDiet(phone, planName, dietState, periodOrder);

  if (error) {
    alert("Erro ao salvar dieta! Tente novamente.");
    return;
  }

  // Aguardar um pouco para o Supabase replicar os dados
  await new Promise((resolve) => setTimeout(resolve, 800));

  window.location.href = "dashboard.html";
};

deleteBtn.onclick = async () => {
  const planName = currentPlanName.trim();
  if (!planName) {
    alert("Nenhuma dieta selecionada para deletar!");
    return;
  }

  if (
    !confirm(
      `Tem certeza que deseja deletar a dieta "${planName}"?\n\nEsta ação não pode ser desfeita.`,
    )
  ) {
    return;
  }

  const { error } = await deleteDietPlan(phone, planName);

  if (error) {
    alert("Erro ao deletar dieta! Tente novamente.");
    console.error("Erro ao deletar:", error);
    return;
  }

  alert("Dieta deletada com sucesso!");
  localStorage.removeItem("currentPlan");
  window.location.href = "dashboard.html";
};
