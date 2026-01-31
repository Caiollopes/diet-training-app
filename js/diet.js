import { supabaseConfig } from "./supabase-config.js";

const { createClient } = supabase;
const supabaseClient = createClient(supabaseConfig.url, supabaseConfig.key);

// Elements
const dietNameSection = document.getElementById("dietNameSection");
const dietMealsSection = document.getElementById("dietMealsSection");
const dietNameInput = document.getElementById("dietName");
const nextBtn = document.getElementById("nextBtn");
const savBtn = document.getElementById("savBtn");
const deleteBtn = document.getElementById("deleteBtn");
const dietTitleDisplay = document.getElementById("dietTitleDisplay");
const editDietNameBtn = document.getElementById("editDietNameBtn");
const mealsList = document.getElementById("mealsList");
const mealNameInput = document.getElementById("mealName");
const mealTimeInput = document.getElementById("mealTime");
const foodItemInput = document.getElementById("foodItemInput");
const addFoodItemBtn = document.getElementById("addFoodItemBtn");
const foodItemsList = document.getElementById("foodItemsList");
const addMealBtn = document.getElementById("addMealBtn");
const step1Indicator = document.getElementById("step1Indicator");
const step2Indicator = document.getElementById("step2Indicator");
const periodButtons = document.querySelectorAll(".period-btn");
const selectedPeriodDisplay = document.getElementById("selectedPeriodDisplay");
const selectedPeriodName = document.getElementById("selectedPeriodName");
const selectedPeriodTime = document.getElementById("selectedPeriodTime");
const clearPeriodBtn = document.getElementById("clearPeriodBtn");
const foodSection = document.getElementById("foodSection");
const addMealCard = document.getElementById("addMealCard");
const closePeriodFormBtn = document.getElementById("closePeriodFormBtn");
const toast = document.getElementById("toast");

let currentUser = null;
let editingDietId = null;
let meals = [];
let currentFoodItems = []; // Array temporário de alimentos para o período atual
let editingMealId = null; // ID do período sendo editado
let editingFoodIndex = null; // Índice do alimento sendo editado
let selectedPeriod = null; // Período selecionado

// Toast notification function
function showToast(message, type = "success") {
  const icon =
    type === "success"
      ? "fa-check-circle"
      : type === "error"
        ? "fa-exclamation-circle"
        : "fa-info-circle";

  toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Period Selection
periodButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const periodName = btn.dataset.period;
    const periodTime = btn.dataset.time;
    const isActive = btn.classList.contains("active");

    if (isActive) {
      // Se já está ativo, alterna visibilidade do formulário
      if (addMealCard.style.display === "none") {
        // Mostrar formulário novamente
        addMealCard.style.display = "block";
        setTimeout(() => {
          addMealCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 100);
      } else {
        // Esconder formulário mas manter botão ativo
        addMealCard.style.display = "none";
      }
    } else {
      // Abre o formulário com o período selecionado
      selectPeriod(periodName, periodTime);
    }
  });
});

clearPeriodBtn.addEventListener("click", clearPeriodSelection);
closePeriodFormBtn.addEventListener("click", closePeriodForm);

function selectPeriod(name, time) {
  selectedPeriod = { name, time };
  mealNameInput.value = name;
  mealTimeInput.value = time;

  // Update UI
  periodButtons.forEach((btn) => btn.classList.remove("active"));
  const activeBtn = Array.from(periodButtons).find(
    (btn) => btn.dataset.period.trim() === name.trim(),
  );
  if (activeBtn) {
    activeBtn.classList.add("active");
  } else {
    // Se não encontrou botão correspondente, não importa - pode ser um período customizado
    console.log("Período não tem botão correspondente:", name);
  }

  selectedPeriodName.textContent = name;
  selectedPeriodTime.textContent = time;
  selectedPeriodDisplay.style.display = "flex";
  foodSection.style.display = "block";

  // Show form with animation
  addMealCard.style.display = "block";
  setTimeout(() => {
    addMealCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 100);

  // Show add food button
  document.getElementById("addFoodItemBtn").style.display = "inline-flex";
}

function closePeriodForm() {
  addMealCard.style.display = "none";
  currentFoodItems = [];
  editingFoodIndex = null;
  selectedPeriodDisplay.style.display = "none";
  foodSection.style.display = "none";
  renderFoodItems();

  // Manter botão ativo - não limpar selectedPeriod nem remover classe active
}

function clearPeriodSelection() {
  selectedPeriod = null;
  mealNameInput.value = "";
  mealTimeInput.value = "";
  currentFoodItems = [];
  editingFoodIndex = null;

  periodButtons.forEach((btn) => btn.classList.remove("active"));
  selectedPeriodDisplay.style.display = "none";
  foodSection.style.display = "none";

  renderFoodItems();
}

// Verificar se está editando
const urlParams = new URLSearchParams(window.location.search);
editingDietId = urlParams.get("id");

// Initialize
async function init() {
  // Verificar se está logado (sistema antigo com telefone)
  const phone = localStorage.getItem("currentUser");
  if (!phone) {
    window.location.href = "index.html";
    return;
  }

  // Tentar obter usuário autenticado do Supabase
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  // Se não tiver usuário do Supabase, usar telefone como identificador
  if (user) {
    currentUser = user;
  } else {
    // Criar objeto fake de usuário com o telefone
    currentUser = { id: phone, phone: phone };
  }

  // Se está editando, carregar dados
  if (editingDietId) {
    await loadDietData(editingDietId);
    deleteBtn.style.display = "inline-flex";
  }
}

// Carregar dados da dieta para edição
async function loadDietData(dietName) {
  try {
    const phone = currentUser.phone || currentUser.id;

    const { data, error } = await supabaseClient
      .from("diets")
      .select("plans")
      .eq("phone", phone)
      .single();

    if (error) throw error;

    const plan = data.plans.find((p) => p.name === dietName);
    if (!plan) throw new Error("Dieta não encontrada");

    dietNameInput.value = plan.name;

    // Converter diet_data de volta para array de meals
    meals = plan.period_order.map((periodKey, index) => {
      const period = plan.diet_data[periodKey];
      // Verificar se foods é string (antigo) ou array (novo)
      const foodsArray =
        typeof period.foods === "string"
          ? period.foods.split("\n").filter((f) => f.trim())
          : period.foods;

      return {
        id: Date.now() + index,
        name: period.name,
        time: period.time || "",
        foods: foodsArray,
      };
    });

    // Avançar para seção de períodos
    goToMealsSection();
  } catch (error) {
    console.error("Erro ao carregar dieta:", error);
    showToast("Erro ao carregar dieta!", "error");
  }
}

// Ir para seção de períodos
function goToMealsSection() {
  const dietName = dietNameInput.value.trim();

  if (!dietName) {
    showToast("Por favor, digite o nome da dieta", "warning");
    dietNameInput.focus();
    return;
  }

  dietNameSection.style.display = "none";
  dietMealsSection.style.display = "block";
  dietTitleDisplay.textContent = dietName;
  step1Indicator.classList.remove("active");
  step2Indicator.classList.add("active");
  renderMeals();
}

// Voltar para seção de nome
function goToNameSection() {
  dietMealsSection.style.display = "none";
  dietNameSection.style.display = "block";
  step2Indicator.classList.remove("active");
  step1Indicator.classList.add("active");
}

// Adicionar ou atualizar alimento à lista temporária
function addFoodItem() {
  const foodItem = foodItemInput.value.trim();

  if (!foodItem) {
    showToast("Por favor, digite um alimento", "warning");
    return;
  }

  if (editingFoodIndex !== null) {
    // Atualizar alimento existente
    currentFoodItems[editingFoodIndex] = foodItem;
    editingFoodIndex = null;
    addFoodItemBtn.innerHTML = '<i class="fas fa-plus"></i>';
  } else {
    // Adicionar novo alimento
    currentFoodItems.push(foodItem);
  }

  foodItemInput.value = "";
  renderFoodItems();
  foodItemInput.focus();
}

// Remover alimento da lista temporária
function removeFoodItem(index) {
  currentFoodItems.splice(index, 1);
  renderFoodItems();
}

// Editar alimento da lista temporária
function editFoodItem(index) {
  editingFoodIndex = index;
  foodItemInput.value = currentFoodItems[index];
  addFoodItemBtn.innerHTML = '<i class="fas fa-save"></i>';
  foodItemInput.focus();
  foodItemInput.select();
}

// Renderizar lista de alimentos temporária
function renderFoodItems() {
  if (currentFoodItems.length === 0) {
    foodItemsList.innerHTML = "";
    return;
  }

  foodItemsList.innerHTML = currentFoodItems
    .map(
      (food, index) => `
      <div class="food-item">
        <span class="food-item-text">${food}</span>
        <div class="food-item-actions">
          <button class="btn-edit-food" onclick="window.editFoodItem(${index})" type="button" title="Editar alimento">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-remove-food" onclick="window.removeFoodItem(${index})" type="button" title="Remover alimento">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `,
    )
    .join("");
}

// Adicionar ou atualizar período
function addMeal() {
  const name = mealNameInput.value.trim();
  const time = mealTimeInput.value;

  if (!name) {
    return;
  }

  if (editingMealId !== null) {
    // Atualizar período existente
    const mealIndex = meals.findIndex((m) => m.id === editingMealId);
    if (mealIndex !== -1) {
      meals[mealIndex] = {
        id: editingMealId,
        name,
        time,
        foods: [...currentFoodItems],
      };
    }
    editingMealId = null;
    addMealBtn.innerHTML =
      '<i class="fas fa-plus"></i><span>Adicionar Período</span>';
  } else {
    // Verificar se período já existe
    const periodExists = meals.some((m) => m.name.trim() === name.trim());
    if (periodExists) {
      showToast("Este período já foi adicionado", "warning");
      return;
    }

    // Adicionar novo período
    meals.push({
      id: Date.now(),
      name,
      time,
      foods: [...currentFoodItems],
    });
  }

  // Fechar formulário e limpar
  closePeriodForm();

  renderMeals();
}

// Remover período
function removeMeal(id) {
  if (confirm("Deseja remover este período?")) {
    meals = meals.filter((m) => m.id !== id);
    renderMeals();
  }
}

// Editar período
function editMeal(id) {
  const meal = meals.find((m) => m.id === id);
  if (!meal) return;

  // Preencher formulário com dados do período
  selectPeriod(meal.name, meal.time || "");
  currentFoodItems = [...meal.foods];
  renderFoodItems();

  // Atualizar estado de edição
  editingMealId = id;
  addMealBtn.innerHTML =
    '<i class="fas fa-check"></i><span>Salvar Período</span>';

  // Scroll suave até o formulário
  document
    .querySelector(".add-meal-card")
    .scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Cancelar edição
function cancelEditMeal() {
  editingMealId = null;
  clearPeriodSelection();
  addMealBtn.innerHTML =
    '<i class="fas fa-plus"></i><span>Adicionar Período</span>';
}

// Renderizar períodos
function renderMeals() {
  if (meals.length === 0) {
    mealsList.innerHTML = "";
    // Habilitar todos os botões quando não há períodos
    periodButtons.forEach((btn) => {
      btn.disabled = false;
      btn.style.opacity = "1";
    });
    return;
  }

  // Desabilitar botões de períodos já adicionados
  periodButtons.forEach((btn) => {
    const periodName = btn.dataset.period.trim();
    const isAdded = meals.some((m) => m.name.trim() === periodName);
    btn.disabled = isAdded;
    btn.style.opacity = isAdded ? "0.5" : "1";
    btn.style.cursor = isAdded ? "not-allowed" : "pointer";
  });

  mealsList.innerHTML = meals
    .map(
      (meal) => `
    <div class="meal-item">
      <div class="meal-header">
        <div class="meal-info">
          <div class="meal-name">
            <i class="fas fa-utensils"></i>
            ${meal.name}
          </div>
          ${
            meal.time
              ? `
            <div class="meal-time">
              <i class="fas fa-clock"></i>
              ${meal.time}
            </div>
          `
              : ""
          }
        </div>
        <div class="meal-actions">
          <button class="btn-edit-period" onclick="window.editMeal(${meal.id})" title="Editar período">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-remove" onclick="window.removeMeal(${meal.id})" title="Remover período">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="meal-foods">
        <div class="meal-foods-label">
          <i class="fas fa-apple-alt"></i>
          Alimentos
        </div>
        <div class="meal-foods-text">
          ${
            Array.isArray(meal.foods)
              ? meal.foods
                  .map(
                    (food) =>
                      `<div style="margin-bottom: 4px;">• ${food}</div>`,
                  )
                  .join("")
              : meal.foods
          }
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

// Salvar dieta
async function saveDiet() {
  const dietName = dietNameInput.value.trim();

  if (!dietName) {
    showToast("Por favor, digite o nome da dieta", "warning");
    goToNameSection();
    dietNameInput.focus();
    return;
  }

  if (meals.length === 0) {
    showToast("Por favor, adicione pelo menos um período", "warning");
    return;
  }

  try {
    savBtn.disabled = true;
    savBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> <span>Salvando...</span>';

    const phone = currentUser.phone || currentUser.id;

    // Buscar planos existentes
    const { data: existingData } = await supabaseClient
      .from("diets")
      .select("plans")
      .eq("phone", phone)
      .single();

    let plans = existingData?.plans || [];

    // Preparar dados da dieta no formato do sistema
    const dietData = {};
    meals.forEach((meal, index) => {
      const periodKey = `period${index + 1}`;
      dietData[periodKey] = {
        name: meal.name,
        time: meal.time || "",
        foods: Array.isArray(meal.foods) ? meal.foods : [meal.foods], // Sempre salvar como array
      };
    });

    const periodOrder = meals.map((_, index) => `period${index + 1}`);

    const planData = {
      name: dietName,
      diet_data: dietData,
      period_order: periodOrder,
      updated_at: new Date().toISOString(),
    };

    if (editingDietId) {
      // Atualizar dieta existente
      const planIndex = plans.findIndex((p) => p.name === editingDietId);
      if (planIndex >= 0) {
        plans[planIndex] = planData;
      }
    } else {
      // Adicionar nova dieta
      plans.push(planData);
    }

    // Salvar no banco
    const { error } = await supabaseClient.from("diets").upsert(
      {
        phone,
        plans: plans,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "phone" },
    );

    if (error) throw error;

    showToast(
      editingDietId
        ? "Dieta atualizada com sucesso!"
        : "Dieta criada com sucesso!",
      "success",
    );

    setTimeout(() => {
      window.location.href = "diet-dashboard.html";
    }, 1500);
  } catch (error) {
    console.error("Erro ao salvar dieta:", error);
    showToast("Erro ao salvar dieta: " + error.message, "error");
    savBtn.disabled = false;
    savBtn.innerHTML = '<i class="fas fa-save"></i> <span>Salvar Dieta</span>';
  }
}

// Deletar dieta
async function deleteDietHandler() {
  if (!confirm("Tem certeza que deseja deletar esta dieta?")) {
    return;
  }

  try {
    deleteBtn.disabled = true;
    deleteBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> <span>Deletando...</span>';

    const phone = currentUser.phone || currentUser.id;

    // Buscar planos existentes
    const { data: existingData } = await supabaseClient
      .from("diets")
      .select("plans")
      .eq("phone", phone)
      .single();

    if (existingData) {
      // Remover a dieta do array de plans
      const plans = existingData.plans.filter((p) => p.name !== editingDietId);

      // Atualizar no banco
      const { error } = await supabaseClient
        .from("diets")
        .update({
          plans: plans,
          updated_at: new Date().toISOString(),
        })
        .eq("phone", phone);

      if (error) throw error;
    }

    showToast("Dieta deletada com sucesso!", "success");

    setTimeout(() => {
      window.location.href = "diet-dashboard.html";
    }, 1500);
  } catch (error) {
    console.error("Erro ao deletar dieta:", error);
    showToast("Erro ao deletar dieta: " + error.message, "error");
    deleteBtn.disabled = false;
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> <span>Deletar</span>';
  }
}

// Event Listeners
nextBtn.addEventListener("click", goToMealsSection);
editDietNameBtn.addEventListener("click", goToNameSection);
addFoodItemBtn.addEventListener("click", addFoodItem);
addMealBtn.addEventListener("click", addMeal);
savBtn.addEventListener("click", saveDiet);
deleteBtn.addEventListener("click", deleteDietHandler);

// Atalho Enter no input de nome
dietNameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    goToMealsSection();
  }
});

// Atalho Enter no input de alimento
foodItemInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addFoodItem();
  }
});

// Expor funções para remover
window.removeMeal = removeMeal;
window.editMeal = editMeal;
window.removeFoodItem = removeFoodItem;
window.editFoodItem = editFoodItem;

// Inicializar
init();
