import { maskPhone } from "./utils.js";
import { getUserByPhone, supabase } from "./supabase-config.js";

const input = document.getElementById("phoneLookup");
const btn = document.getElementById("accessBtn");
const error = document.getElementById("homeError");

maskPhone(input);

btn.onclick = async () => {
  error.classList.add("hidden");

  const phone = input.value.replace(/\D/g, "");
  if (phone.length !== 11) return;

  const { data, error: err } = await getUserByPhone(phone);

  if (err || !data) {
    error.classList.remove("hidden");
    return;
  }

  localStorage.setItem("currentUser", phone);
  window.location.href = "dashboard.html";
};
