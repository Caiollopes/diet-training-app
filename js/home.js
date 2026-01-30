import { maskPhone } from "./utils.js";
import { getUserByPhone, supabase } from "./supabase-config.js";

const input = document.getElementById("phoneLookup");
const btn = document.getElementById("accessBtn");
const error = document.getElementById("homeError");

console.log("home.js carregado");
console.log("input:", input);
console.log("btn:", btn);
console.log("error:", error);

maskPhone(input);

if (btn) {
  btn.onclick = async (e) => {
    e.preventDefault();
    console.log("Botão Acessar clicado");

    error.classList.add("hidden");

    const phone = input.value.replace(/\D/g, "");
    console.log("Telefone digitado:", phone);

    if (phone.length !== 11) {
      console.log("Telefone inválido, deve ter 11 dígitos");
      error.classList.remove("hidden");
      return;
    }

    console.log("Buscando usuário com telefone:", phone);
    const { data, error: err } = await getUserByPhone(phone);

    console.log("Resultado da busca:", data, err);

    if (err || !data) {
      console.log("Usuário não encontrado");
      error.classList.remove("hidden");
      return;
    }

    console.log("Usuário encontrado, redirecionando...");
    localStorage.setItem("currentUser", phone);
    window.location.href = "user-home.html";
  };
} else {
  console.error("Botão accessBtn não encontrado!");
}
