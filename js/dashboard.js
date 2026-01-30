import { getDiet, getUserByPhone } from "./supabase-config.js";

const phone = localStorage.getItem("currentUser");
if (!phone) window.location.href = "index.html";

let userData = null;
let dietData = null;

// Carregar dados do Supabase
loadData();

async function loadData() {
  // Obter dados do usuário
  const { data: user } = await getUserByPhone(phone);
  userData = user;

  if (userData) {
    document.getElementById("username").textContent =
      `Dieta de ${userData.name}`;
  }

  // Obter dieta
  const { data: diet } = await getDiet(phone);
  dietData = diet;

  if (
    !dietData ||
    !dietData.diet_data ||
    Object.keys(dietData.diet_data).length === 0
  ) {
    document.getElementById("dietView").innerHTML =
      "<p>Nenhuma dieta cadastrada.</p>";
  } else {
    renderDashboard(dietData);
  }
}

document.getElementById("editDiet").onclick = () => {
  window.location.href = "diet.html";
};

// Recarregar dados ao voltar da página de edição
window.addEventListener("pageshow", () => {
  loadData();
});

document.getElementById("downloadPDF").onclick = () => {
  // PDF download será implementado aqui
};

function renderDashboard(dietData) {
  const container = document.getElementById("dietView");
  container.innerHTML = "";

  const diet = dietData.diet_data || {};
  const periodOrder = dietData.period_order || [];
  let periods = Object.entries(diet);

  // Ordena os períodos se houver uma ordem salva
  if (periodOrder.length > 0) {
    periods.sort(
      (a, b) => periodOrder.indexOf(a[0]) - periodOrder.indexOf(b[0]),
    );
  }

  periods.forEach(([period, info]) => {
    const section = document.createElement("div");
    section.className = "period-view";

    const mealsHTML = (info.meals || [])
      .map(
        (m) =>
          `<div class="meal-item">
            <div class="meal-content">
              <span class="meal-text">${m.meal}</span>
              <span class="meal-qty">${m.qty}</span>
            </div>
           </div>`,
      )
      .join("");

    section.innerHTML = `
      <h3>${period} - ${info.time || "00:00"}</h3>
      <div class="meal-list">
        ${mealsHTML}
      </div>
    `;

    container.appendChild(section);
  });
}
