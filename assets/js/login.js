
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (usuario === "" || senha === "") {
    loginError.style.display = "block";
    return;
  }

  localStorage.setItem("usuarioLogado", usuario);

  window.location.href = "dashboard.html";
});