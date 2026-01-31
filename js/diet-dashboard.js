import { supabaseConfig } from "./supabase-config.js";

const { createClient } = supabase;
const supabaseClient = createClient(supabaseConfig.url, supabaseConfig.key);

// Elements
const dietSelect = document.getElementById("dietSelect");
const dietDetailsCard = document.getElementById("dietDetailsCard");
const emptyState = document.getElementById("emptyState");
const mealsList = document.getElementById("mealsList");
const dietNameDisplay = document.getElementById("dietName");
const newDietBtn = document.getElementById("newDietBtn");
const editDietBtn = document.getElementById("editDietBtn");
const createFirstDietBtn = document.getElementById("createFirstDietBtn");

let currentUser = null;
let diets = [];
let selectedDiet = null;

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

  await loadDiets();
}

// Carregar dietas
async function loadDiets() {
  try {
    const phone = currentUser.phone || currentUser.id;

    const { data, error } = await supabaseClient
      .from("diets")
      .select("plans")
      .eq("phone", phone)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    // Extrair array de plans (dietas)
    const plans = data?.plans || [];
    diets = plans.map((plan, index) => ({
      id: plan.name, // Usar nome como ID
      name: plan.name,
      diet_data: plan.diet_data,
      period_order: plan.period_order,
      updated_at: plan.updated_at,
    }));

    renderDietSelect();

    if (diets.length === 0) {
      showEmptyState();
    } else {
      hideEmptyState();
    }
  } catch (error) {
    console.error("Erro ao carregar dietas:", error);
    showEmptyState();
  }
}

// Renderizar select de dietas
function renderDietSelect() {
  dietSelect.innerHTML = '<option value="">Selecione uma dieta</option>';

  diets.forEach((diet) => {
    const option = document.createElement("option");
    option.value = diet.id;
    option.textContent = diet.name;
    dietSelect.appendChild(option);
  });
}

// Mostrar detalhes da dieta
async function showDietDetails(dietId) {
  selectedDiet = diets.find((d) => d.id === dietId);
  if (!selectedDiet) return;

  try {
    // Converter diet_data para array de meals
    const meals = selectedDiet.period_order.map((periodKey) => {
      const period = selectedDiet.diet_data[periodKey];
      return {
        name: period.name,
        time: period.time || "",
        foods: period.foods,
      };
    });

    dietNameDisplay.textContent = selectedDiet.name;
    renderMeals(meals || []);
    dietDetailsCard.style.display = "block";
    editDietBtn.style.display = "inline-flex";
  } catch (error) {
    console.error("Erro ao carregar refeições:", error);
  }
}

// Renderizar períodos
function renderMeals(meals) {
  if (meals.length === 0) {
    mealsList.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
        <i class="fas fa-utensils" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
        <p>Nenhum período cadastrado para esta dieta</p>
      </div>
    `;
    return;
  }

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

// Mostrar/ocultar empty state
function showEmptyState() {
  emptyState.style.display = "block";
  dietDetailsCard.style.display = "none";
  editDietBtn.style.display = "none";
}

function hideEmptyState() {
  emptyState.style.display = "none";
}

// Event Listeners
dietSelect.addEventListener("change", (e) => {
  if (e.target.value) {
    showDietDetails(e.target.value);
  } else {
    dietDetailsCard.style.display = "none";
    editDietBtn.style.display = "none";
  }
});

newDietBtn.addEventListener("click", () => {
  window.location.href = "diet.html";
});

createFirstDietBtn.addEventListener("click", () => {
  window.location.href = "diet.html";
});

editDietBtn.addEventListener("click", () => {
  if (selectedDiet) {
    window.location.href = `diet.html?id=${selectedDiet.id}`;
  }
});

// Inicializar
init();
