// Dark Mode Toggle
function initDarkMode() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const saved = localStorage.getItem("darkMode");
  const isDarkMode = saved ? saved === "true" : prefersDark;

  applyTheme(isDarkMode);

  // Verificar se existe botão de toggle no HTML
  const existingToggle = document.getElementById("darkModeToggle");
  if (existingToggle) {
    // Atualizar ícone do botão existente
    existingToggle.innerHTML = isDarkMode
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
    existingToggle.title = isDarkMode ? "Modo claro" : "Modo escuro";
    existingToggle.onclick = toggleDarkMode;
  }
  // Mostrar botão apenas na página de início
  else if (
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("/")
  ) {
    createThemeToggle();
  }
}

function createThemeToggle() {
  const btn = document.createElement("button");
  btn.className = "theme-toggle";
  btn.innerHTML = document.body.classList.contains("dark-mode")
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
  btn.title = document.body.classList.contains("dark-mode")
    ? "Modo claro"
    : "Modo escuro";

  btn.onclick = toggleDarkMode;

  document.body.appendChild(btn);
}

function toggleDarkMode() {
  const isDark = !document.body.classList.contains("dark-mode");
  applyTheme(isDark);
  localStorage.setItem("darkMode", isDark);

  // Atualizar botão flutuante se existir
  const btn = document.querySelector(".theme-toggle");
  if (btn) {
    btn.innerHTML = isDark
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
    btn.title = isDark ? "Modo claro" : "Modo escuro";
  }

  // Atualizar botão do header se existir
  const headerBtn = document.getElementById("darkModeToggle");
  if (headerBtn) {
    headerBtn.innerHTML = isDark
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
    headerBtn.title = isDark ? "Modo claro" : "Modo escuro";
  }
}

function applyTheme(isDark) {
  document.body.classList.toggle("dark-mode", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  if (!isDark) {
    removeInlineDarkStyle();
  }
}

function removeInlineDarkStyle() {
  const styles = [...document.querySelectorAll("style")];
  styles.forEach((style) => {
    const text = style.textContent || "";
    if (text.includes("body { background: #1f2937")) {
      style.remove();
    }
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", initDarkMode);
