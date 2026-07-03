const usuarioLogado = localStorage.getItem("usuarioLogado");

if (!usuarioLogado) {
  window.location.href = "../login.html";
}

const logoutBtn = document.getElementById("logoutBtn");
const abrirModalBtn = document.getElementById("abrirModalBtn");
const fecharModalBtn = document.getElementById("fecharModalBtn");
const cancelarBtn = document.getElementById("cancelarBtn");
const modalFuncionario = document.getElementById("modalFuncionario");
const formFuncionario = document.getElementById("formFuncionario");
const listaFuncionarios = document.getElementById("listaFuncionarios");
const pesquisaFuncionario = document.getElementById("pesquisaFuncionario");
const tituloModal = document.getElementById("tituloModal");

let funcionarios = JSON.parse(localStorage.getItem("funcionarios")) || [];

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "../login.html";
});

abrirModalBtn.addEventListener("click", () => {
  abrirModal();
});

fecharModalBtn.addEventListener("click", fecharModal);
cancelarBtn.addEventListener("click", fecharModal);

function abrirModal(funcionario = null) {
  modalFuncionario.classList.add("active");
  formFuncionario.reset();

  if (funcionario) {
    tituloModal.textContent = "Editar Funcionário";

    document.getElementById("funcionarioId").value = funcionario.id;
    document.getElementById("nome").value = funcionario.nome;
    document.getElementById("email").value = funcionario.email;
    document.getElementById("telefone").value = funcionario.telefone;
    document.getElementById("cargo").value = funcionario.cargo;
    document.getElementById("perfil").value = funcionario.perfil;
    document.getElementById("status").value = funcionario.status;
  } else {
    tituloModal.textContent = "Novo Funcionário";
    document.getElementById("funcionarioId").value = "";
  }
}

function fecharModal() {
  modalFuncionario.classList.remove("active");
  formFuncionario.reset();
}

formFuncionario.addEventListener("submit", function (event) {
  event.preventDefault();

  const id = document.getElementById("funcionarioId").value;

  const funcionario = {
    id: id || Date.now().toString(),
    nome: document.getElementById("nome").value.trim(),
    email: document.getElementById("email").value.trim(),
    telefone: document.getElementById("telefone").value.trim(),
    cargo: document.getElementById("cargo").value.trim(),
    perfil: document.getElementById("perfil").value,
    status: document.getElementById("status").value
  };

  if (id) {
    funcionarios = funcionarios.map(item => {
      return item.id === id ? funcionario : item;
    });
  } else {
    funcionarios.push(funcionario);
  }

  salvarFuncionarios();
  renderizarFuncionarios();
  fecharModal();
});

function salvarFuncionarios() {
  localStorage.setItem("funcionarios", JSON.stringify(funcionarios));
}

function renderizarFuncionarios(filtro = "") {
  const listaFiltrada = funcionarios.filter(funcionario => {
    const termo = filtro.toLowerCase();

    return (
      funcionario.nome.toLowerCase().includes(termo) ||
      funcionario.email.toLowerCase().includes(termo) ||
      funcionario.cargo.toLowerCase().includes(termo) ||
      funcionario.perfil.toLowerCase().includes(termo)
    );
  });

  if (listaFiltrada.length === 0) {
    listaFuncionarios.innerHTML = `
      <tr>
        <td colspan="7">Nenhum funcionário encontrado.</td>
      </tr>
    `;
    return;
  }

  listaFuncionarios.innerHTML = listaFiltrada.map(funcionario => {
    const statusClasse = funcionario.status === "Ativo" ? "ativo" : "inativo";

    return `
      <tr>
        <td>${funcionario.nome}</td>
        <td>${funcionario.email}</td>
        <td>${funcionario.telefone}</td>
        <td>${funcionario.cargo}</td>
        <td>${funcionario.perfil}</td>
        <td><span class="badge ${statusClasse}">${funcionario.status}</span></td>
        <td>
          <div class="actions">
            <button class="btn-edit" onclick="editarFuncionario('${funcionario.id}')">Editar</button>
            <button class="btn-delete" onclick="excluirFuncionario('${funcionario.id}')">Excluir</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function editarFuncionario(id) {
  const funcionario = funcionarios.find(item => item.id === id);

  if (funcionario) {
    abrirModal(funcionario);
  }
}

function excluirFuncionario(id) {
  const confirmar = confirm("Deseja realmente excluir este funcionário?");

  if (!confirmar) return;

  funcionarios = funcionarios.filter(item => item.id !== id);
  salvarFuncionarios();
  renderizarFuncionarios();
}

pesquisaFuncionario.addEventListener("input", function () {
  renderizarFuncionarios(this.value);
});

renderizarFuncionarios();