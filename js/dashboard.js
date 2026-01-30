import { getDiet, getUserByPhone } from "./supabase-config.js";

const phone = localStorage.getItem("currentUser");
if (!phone) window.location.href = "index.html";

let userData = null;
let dietData = null;

// Mostrar skeleton loader
showSkeleton();

// Carregar dados do Supabase
loadData();

function showSkeleton() {
  const container = document.getElementById("dietView");
  container.innerHTML = `
    <div class="skeleton-period">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-meal"></div>
      <div class="skeleton skeleton-meal"></div>
      <div class="skeleton skeleton-meal"></div>
    </div>
    <div class="skeleton-period">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-meal"></div>
      <div class="skeleton skeleton-meal"></div>
    </div>
    <div class="skeleton-period">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-meal"></div>
      <div class="skeleton skeleton-meal"></div>
      <div class="skeleton skeleton-meal"></div>
    </div>
  `;
}

async function loadData() {
  // Mostra skeleton
  showSkeleton();
  // Obter dados do usuário
  const { data: user } = await getUserByPhone(phone);
  userData = user;

  if (userData) {
    document.getElementById("username").textContent =
      `Dieta de ${userData.name}`;
  }

  // Obter dieta com retry se necessário
  let { data: diet, error } = await getDiet(phone);

  // Se houver erro ou dados vazios, tenta novamente
  if ((error || !diet) && localStorage.getItem("currentPlan")) {
    console.log("Primeira tentativa falhou, tentando novamente...");
    await new Promise((resolve) => setTimeout(resolve, 500));
    const result = await getDiet(phone);
    diet = result.data;
    error = result.error;
  }

  dietData = diet;

  console.log("Dados carregados do Supabase:", dietData);

  // Carregar planos disponíveis
  if (
    dietData &&
    dietData.plans &&
    Array.isArray(dietData.plans) &&
    dietData.plans.length > 0
  ) {
    const planSelect = document.getElementById("planSelect");
    planSelect.innerHTML = "";

    dietData.plans.forEach((plan) => {
      const option = document.createElement("option");
      option.value = plan.name;
      option.textContent = plan.name;
      planSelect.appendChild(option);
    });

    // Definir plano atual
    const currentPlan =
      localStorage.getItem("currentPlan") || dietData.plans[0].name;
    planSelect.value = currentPlan;
    localStorage.setItem("currentPlan", currentPlan);

    // Renderizar o plano selecionado
    const selectedPlan = dietData.plans.find((p) => p.name === currentPlan);
    if (selectedPlan) {
      dietData.diet_data = selectedPlan.diet_data;
      dietData.period_order = selectedPlan.period_order;
      renderDashboard(dietData);
    }

    // Event listener para trocar de plano
    planSelect.onchange = (e) => {
      const planName = e.target.value;
      localStorage.setItem("currentPlan", planName);
      const plan = dietData.plans.find((p) => p.name === planName);
      if (plan) {
        dietData.diet_data = plan.diet_data;
        dietData.period_order = plan.period_order;
        renderDashboard(dietData);
      }
    };
  } else {
    document.getElementById("dietView").innerHTML =
      "<p>Nenhuma dieta cadastrada.</p>";
  }
}

document.getElementById("editDiet").onclick = () => {
  window.location.href = "diet.html";
};

// Recarregar dados ao voltar da página de edição
window.addEventListener("pageshow", (event) => {
  // Recarrega apenas se vier do cache (navegação back/forward)
  if (event.persisted) {
    showSkeleton();
    loadData();
  }
});

// Recarrega quando a página ganha foco (voltando de outra aba/janela)
window.addEventListener("focus", () => {
  showSkeleton();
  loadData();
});

document.getElementById("downloadPDF").onclick = () => {
  const element = document.getElementById("dietView");
  const userName = userData?.name || "Usuario";
  const planName = localStorage.getItem("currentPlan") || "Meu Plano";

  const options = {
    margin: 10,
    filename: `Dieta_${planName}_${userName}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
  };

  const element_to_print = document.createElement("div");
  element_to_print.style.padding = "20px";
  element_to_print.style.backgroundColor = "#ffffff";
  element_to_print.style.color = "#000000";

  const title = document.createElement("h1");
  title.textContent = `Plano: ${planName}`;
  title.style.textAlign = "center";
  title.style.marginBottom = "20px";
  element_to_print.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.textContent = `Usuário: ${userName}`;
  subtitle.style.textAlign = "center";
  subtitle.style.marginBottom = "20px";
  element_to_print.appendChild(subtitle);

  const divider = document.createElement("hr");
  divider.style.marginBottom = "20px";
  element_to_print.appendChild(divider);

  const contentClone = element.cloneNode(true);
  contentClone.style.color = "#000000";
  element_to_print.appendChild(contentClone);

  html2pdf().set(options).from(element_to_print).save();
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
