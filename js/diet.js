import { saveDiet, getDiet } from "./supabase-config.js";

const phone = localStorage.getItem("currentUser");
if (!phone) window.location.href = "index.html";

let dietState = {};
const rendered = {};
let periodOrder = null;
let editingMeal = null;
let editingPeriod = null;

const buttons = document.querySelectorAll("[data-period]");
const container = document.getElementById("periodsContainer");
const saveBtn = document.getElementById("saveDiet");

// Carregar dieta do Supabase
loadDiet();

async function loadDiet() {
  const { data } = await getDiet(phone);

  if (data) {
    dietState = data.diet_data || {};
    periodOrder = data.period_order || [];
  } else {
    dietState = {};
    periodOrder = [];
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

buttons.forEach((btn) => {
  btn.onclick = () => {
    const period = btn.dataset.period;
    const isActive = btn.classList.contains("active");

    if (isActive) {
      delete dietState[period];
      if (rendered[period]) {
        container.removeChild(rendered[period]);
        delete rendered[period];
        btn.classList.remove("active");
      }
    } else {
      if (!dietState[period]) {
        dietState[period] = { time: "00:00", meals: [] };
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
  await saveDiet(phone, dietState, periodOrder);
  window.location.href = "dashboard.html";
};
