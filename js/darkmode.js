// Dark Mode Toggle
function initDarkMode() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const saved = localStorage.getItem("darkMode");
  const isDarkMode = saved ? saved === "true" : prefersDark;

  applyTheme(isDarkMode);

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
  const isDark = !document.body.classList.contains("dark-mode");
  applyTheme(isDark);
  localStorage.setItem("darkMode", isDark);

  const btn = document.querySelector(".theme-toggle");
  btn.innerHTML = isDark
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
  btn.title = isDark ? "Modo claro" : "Modo escuro";
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
