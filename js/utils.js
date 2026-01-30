export function maskPhone(input) {
  input.addEventListener("input", () => {
    let value = input.value.replace(/\D/g, "").slice(0, 11);

    if (value.length >= 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }

    if (value.length >= 10) {
      value = `${value.slice(0, 10)}-${value.slice(10)}`;
    }

    input.value = value;
  });
}
