// Dark Mode Toggle
function initDarkMode() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const saved = localStorage.getItem("darkMode");
  const isDarkMode = saved ? saved === "true" : prefersDark;

  if (isDarkMode) {
    document.body.classList.add("dark-mode");
  }

  // Mostrar botão apenas na página de início
  if (
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
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", isDark);

  const btn = document.querySelector(".theme-toggle");
  btn.innerHTML = isDark
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
  btn.title = isDark ? "Modo claro" : "Modo escuro";
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", initDarkMode);
