import { maskPhone } from "./utils.js";
import { createUser, getUserByPhone } from "./supabase-config.js";

const phoneInput = document.getElementById("phone");
const nameInput = document.getElementById("name");
const warn = document.getElementById("registerWarn");

maskPhone(phoneInput);

document.getElementById("save").onclick = async () => {
  warn.classList.add("hidden");

  const name = nameInput.value.trim();
  const phone = phoneInput.value.replace(/\D/g, "");

  if (!name || phone.length !== 11) return;

  // Verificar se já existe
  const { data: existingUser } = await getUserByPhone(phone);

  if (existingUser) {
    warn.classList.remove("hidden");
    return;
  }

  // Criar novo usuário
  const { data, error } = await createUser(name, phone);

  if (error) {
    warn.classList.remove("hidden");
    return;
  }

  localStorage.setItem("currentUser", phone);
  window.location.href = "diet.html";
};

document.getElementById("cancel").onclick = () => {
  window.location.href = "index.html";
};

phoneInput.oninput = () => {
  warn.classList.add("hidden");
};
