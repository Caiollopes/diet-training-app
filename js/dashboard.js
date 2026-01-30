const phone = localStorage.getItem("currentUser");
if (!phone) window.location.href = "index.html";

let users = JSON.parse(localStorage.getItem("users")) || {};
let data = users[phone];

if (!data || !data.diet) {
  document.getElementById("dietView").innerHTML =
    "<p>Nenhuma dieta cadastrada.</p>";
} else {
  renderDashboard(data);
}

document.getElementById("editDiet").onclick = () => {
  window.location.href = "diet.html";
};

// Recarregar dados ao voltar da página de edição
window.addEventListener("pageshow", () => {
  users = JSON.parse(localStorage.getItem("users")) || {};
  data = users[phone];

  if (!data || !data.diet) {
    document.getElementById("dietView").innerHTML =
      "<p>Nenhuma dieta cadastrada.</p>";
  } else {
    renderDashboard(data);
  }
});

document.getElementById("downloadPDF").onclick = () => {
  // PDF download será implementado aqui
};

function renderDashboard(data) {
  document.getElementById("username").textContent =
    `Dieta de ${data.user.name}`;

  const container = document.getElementById("dietView");
  container.innerHTML = "";

  let periodOrder = JSON.parse(localStorage.getItem(`dietOrder_${phone}`));
  let periods = Object.entries(data.diet);

  // Ordena os períodos se houver uma ordem salva
  if (periodOrder) {
    periods.sort(
      (a, b) => periodOrder.indexOf(a[0]) - periodOrder.indexOf(b[0]),
    );
  }

  periods.forEach(([period, info]) => {
    const section = document.createElement("div");
    section.className = "period-view";

    const mealsHTML = info.meals
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
      <h3>${period} - ${info.time}</h3>
      <div class="meal-list">
        ${mealsHTML}
      </div>
    `;

    container.appendChild(section);
  });
}
