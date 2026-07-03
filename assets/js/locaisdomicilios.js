const usuarioLogado = localStorage.getItem("usuarioLogado");

if (!usuarioLogado) {
  window.location.href = "../login.html";
}

const logoutBtn = document.getElementById("logoutBtn");
const formLocal = document.getElementById("formLocal");
const limparBtn = document.getElementById("limparBtn");
const pesquisaLocal = document.getElementById("pesquisaLocal");
const listaLocais = document.getElementById("listaLocais");

const classificacaoLocal = document.getElementById("classificacaoLocal");
const tipoLocal = document.getElementById("tipoLocal");
const siglaLocal = document.getElementById("siglaLocal");
const codigoLocal = document.getElementById("codigoLocal");
const unidadeVinculada = document.getElementById("unidadeVinculada");

let mapaCadastroLocal = null;
let marcadorCadastroLocal = null;

const COORDENADA_PADRAO_MAUES = {
  latitude: -3.3836,
  longitude: -57.7186
};

let locais = JSON.parse(localStorage.getItem("locaisDomicilios")) || [];

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "../login.html";
});

function textoSeguro(valor) {
  return String(valor || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function salvarLocais() {
  localStorage.setItem("locaisDomicilios", JSON.stringify(locais));
}

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 6);
}

function gerarPrefixo() {
  const sigla = normalizarTexto(siglaLocal.value);

  if (sigla) return sigla;

  if (tipoLocal.value === "UBS") return "UBS";
  if (tipoLocal.value === "Hospital") return "HOSP";
  if (tipoLocal.value === "Conselho") return "CONS";
  if (tipoLocal.value.includes("Domicílio")) return "DOM";
  if (tipoLocal.value.includes("Comunidade")) return "COM";

  return "LOC";
}

function gerarCodigoLocal() {
  const ano = new Date().getFullYear();
  const prefixo = gerarPrefixo();

  const quantidade = locais.filter(local =>
    local.codigoLocal && local.codigoLocal.startsWith(`${prefixo}-${ano}`)
  ).length + 1;

  return `${prefixo}-${ano}-${String(quantidade).padStart(4, "0")}`;
}

function atualizarCodigoLocal() {
  if (!classificacaoLocal.value || !tipoLocal.value) {
    codigoLocal.value = "";
    return;
  }

  codigoLocal.value = gerarCodigoLocal();
}

[classificacaoLocal, tipoLocal, siglaLocal].forEach(campo => {
  campo.addEventListener("input", atualizarCodigoLocal);
  campo.addEventListener("change", atualizarCodigoLocal);
});

function carregarUnidadesVinculadas() {
  unidadeVinculada.innerHTML = `<option value="">Não se aplica</option>`;

  locais
    .filter(local => local.status !== "Inativo")
    .forEach(local => {
      unidadeVinculada.innerHTML += `
        <option value="${textoSeguro(local.id)}">
          ${textoSeguro(local.nomeLocal)} — ${textoSeguro(local.tipoLocal)}
        </option>
      `;
    });
}

function iniciarMapa() {
  if (typeof L === "undefined") return;

  const maues = [
    COORDENADA_PADRAO_MAUES.latitude,
    COORDENADA_PADRAO_MAUES.longitude
  ];

  mapaCadastroLocal = L.map("mapaCadastroLocal", {
    scrollWheelZoom: false
  }).setView(maues, 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
    maxZoom: 19
  }).addTo(mapaCadastroLocal);

  marcadorCadastroLocal = L.marker(maues, {
    draggable: true
  }).addTo(mapaCadastroLocal);

  preencherCoordenadas(maues[0], maues[1]);

  mapaCadastroLocal.on("click", event => {
    const lat = event.latlng.lat;
    const lng = event.latlng.lng;

    marcadorCadastroLocal.setLatLng([lat, lng]);
    preencherCoordenadas(lat, lng);
  });

  marcadorCadastroLocal.on("dragend", () => {
    const posicao = marcadorCadastroLocal.getLatLng();
    preencherCoordenadas(posicao.lat, posicao.lng);
  });
}

function preencherCoordenadas(lat, lng) {
  document.getElementById("latitudeLocal").value = Number(lat).toFixed(6);
  document.getElementById("longitudeLocal").value = Number(lng).toFixed(6);
}

function gerarLinkGoogleMaps(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

document.getElementById("buscarEndereco").addEventListener("click", async () => {
  const busca = document.getElementById("buscaMapa").value.trim();

  if (!busca) {
    alert("Digite um endereço, bairro ou comunidade.");
    return;
  }

  try {
    const query = encodeURIComponent(`${busca}, Maués, Amazonas, Brasil`);
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${query}&limit=1`;

    const resposta = await fetch(url);
    const dados = await resposta.json();

    if (!dados.length) {
      alert("Local não encontrado. Marque manualmente no mapa.");
      return;
    }

    const lat = parseFloat(dados[0].lat);
    const lng = parseFloat(dados[0].lon);

    mapaCadastroLocal.setView([lat, lng], 17);
    marcadorCadastroLocal.setLatLng([lat, lng]);
    preencherCoordenadas(lat, lng);

  } catch {
    alert("Erro ao buscar localização.");
  }
});

document.getElementById("usarLocalizacao").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Seu navegador não permite acessar localização.");
    return;
  }

  navigator.geolocation.getCurrentPosition(posicao => {
    const lat = posicao.coords.latitude;
    const lng = posicao.coords.longitude;

    mapaCadastroLocal.setView([lat, lng], 17);
    marcadorCadastroLocal.setLatLng([lat, lng]);
    preencherCoordenadas(lat, lng);
  });
});

formLocal.addEventListener("submit", event => {
  event.preventDefault();

  const latitude = document.getElementById("latitudeLocal").value;
  const longitude = document.getElementById("longitudeLocal").value;

  const novoLocal = {
    id: Date.now().toString(),
    codigoLocal: codigoLocal.value,
    classificacaoLocal: classificacaoLocal.value,
    tipoLocal: tipoLocal.value,
    nomeLocal: document.getElementById("nomeLocal").value.trim(),
    siglaLocal: siglaLocal.value.trim(),
    status: document.getElementById("statusLocal").value,
    responsavelLocal: document.getElementById("responsavelLocal").value.trim(),
    telefoneResponsavel: document.getElementById("telefoneResponsavel").value.trim(),
    unidadeVinculada: unidadeVinculada.value,
    vinculoLocal: document.getElementById("vinculoLocal").value.trim(),
    endereco: document.getElementById("enderecoLocal").value.trim(),
    bairro: document.getElementById("bairroLocal").value.trim(),
    numero: document.getElementById("numeroLocal").value.trim(),
    complemento: document.getElementById("complementoLocal").value.trim(),
    rioRamalEstrada: document.getElementById("rioRamalEstrada").value.trim(),
    googleMapsUrl: document.getElementById("googleMapsUrl").value.trim() || gerarLinkGoogleMaps(latitude, longitude),
    referencia: document.getElementById("referenciaLocal").value.trim(),
    latitude,
    longitude,
    observacoes: document.getElementById("observacoesLocal").value.trim(),
    criadoEm: new Date().toLocaleString("pt-BR")
  };

  locais.push(novoLocal);
  salvarLocais();
  carregarUnidadesVinculadas();
  renderizarLocais();
  formLocal.reset();
  atualizarCodigoLocal();

  alert("Local/Domicílio cadastrado com sucesso!");
});

function renderizarLocais(filtro = "") {
  const termo = filtro.toLowerCase();

  const filtrados = locais.filter(local => {
    return `
      ${local.codigoLocal}
      ${local.nomeLocal}
      ${local.tipoLocal}
      ${local.classificacaoLocal}
      ${local.bairro}
      ${local.endereco}
      ${local.status}
    `.toLowerCase().includes(termo);
  });

  if (filtrados.length === 0) {
    listaLocais.innerHTML = `<p>Nenhum local cadastrado.</p>`;
    return;
  }

  listaLocais.innerHTML = filtrados.slice().reverse().map(local => {
    const statusClass =
      local.status === "Ativo" ? "status-ativo" :
      local.status === "Pendente" ? "status-pendente" :
      local.status === "Em monitoramento" ? "status-monitoramento" :
      "status-inativo";

    return `
      <div class="local-item">
        <span class="local-code">${textoSeguro(local.codigoLocal)}</span>
        <h3>${textoSeguro(local.nomeLocal)}</h3>
        <p><strong>Classificação:</strong> ${textoSeguro(local.classificacaoLocal)}</p>
        <p><strong>Tipo:</strong> ${textoSeguro(local.tipoLocal)}</p>
        <p><strong>Bairro/Comunidade:</strong> ${textoSeguro(local.bairro)}</p>
        <p><strong>Endereço:</strong> ${textoSeguro(local.endereco)}</p>
        <p><strong>Responsável:</strong> ${textoSeguro(local.responsavelLocal || "Não informado")}</p>

        <span class="local-status ${statusClass}">
          ${textoSeguro(local.status)}
        </span>

        <div class="local-actions-card">
          <a href="${local.googleMapsUrl}" target="_blank" class="local-btn map">Mapa</a>
          <button class="local-btn delete" onclick="excluirLocal('${local.id}')">Excluir</button>
        </div>
      </div>
    `;
  }).join("");
}

function excluirLocal(id) {
  if (!confirm("Deseja excluir este local/domicílio?")) return;

  locais = locais.filter(local => local.id !== id);
  salvarLocais();
  carregarUnidadesVinculadas();
  renderizarLocais();
}

limparBtn.addEventListener("click", () => {
  formLocal.reset();
  atualizarCodigoLocal();
});

pesquisaLocal.addEventListener("input", function () {
  renderizarLocais(this.value);
});

window.excluirLocal = excluirLocal;

document.addEventListener("DOMContentLoaded", () => {
  iniciarMapa();
  carregarUnidadesVinculadas();
  atualizarCodigoLocal();
  renderizarLocais();
});