const usuarioLogado = localStorage.getItem("usuarioLogado");
const saudacao = document.getElementById("saudacao");
const logoutBtn = document.getElementById("logoutBtn");
const themeBtn = document.getElementById("themeBtn");

if (!usuarioLogado) {
  window.location.href = "login.html";
} else {
  saudacao.textContent = `Olá, ${usuarioLogado}. Bem-vindo ao sistema.`;
}

logoutBtn.addEventListener("click", function () {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
});

themeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeBtn.textContent = "☀️";
    localStorage.setItem("temaSistema", "dark");
  } else {
    themeBtn.textContent = "🌙";
    localStorage.setItem("temaSistema", "light");
  }
});

if (localStorage.getItem("temaSistema") === "dark") {
  document.body.classList.add("dark");
  themeBtn.textContent = "☀️";
}

const denunciasSalvas = JSON.parse(localStorage.getItem("notificacoes")) || [];

const dadosExemplo = [
  { situacao: "Recebida", unidade: "UBS Aracy", mes: "Jan" },
  { situacao: "Em análise", unidade: "UBS Jorge Brito", mes: "Fev" },
  { situacao: "Encaminhada", unidade: "Hospital", mes: "Mar" },
  { situacao: "Em monitoramento", unidade: "UBS Maresia", mes: "Abr" },
  { situacao: "Resolvida", unidade: "UBS Aracy", mes: "Mai" },
  { situacao: "Arquivada", unidade: "UBS Jorge Brito", mes: "Jun" },
  { situacao: "Em análise", unidade: "Hospital", mes: "Jun" },
  { situacao: "Resolvida", unidade: "UBS Maresia", mes: "Jul" }
];

const denuncias = denunciasSalvas.length > 0 ? denunciasSalvas : dadosExemplo;

function contarSituacao(situacao) {
  return denuncias.filter(item => item.situacao === situacao).length;
}

const recebidas = contarSituacao("Recebida");
const analise = contarSituacao("Em análise");
const encaminhadas = contarSituacao("Encaminhada");
const monitoramento = contarSituacao("Em monitoramento");
const resolvidas = contarSituacao("Resolvida");
const arquivadas = contarSituacao("Arquivada");

const total = denuncias.length;

const valoresCards = [total, analise, monitoramento, resolvidas];
const cards = document.querySelectorAll(".contador");

cards.forEach((card, index) => {
  animarContador(card, valoresCards[index]);
});

function animarContador(elemento, valorFinal) {
  let valorAtual = 0;

  const intervalo = setInterval(() => {
    if (valorAtual >= valorFinal) {
      elemento.textContent = valorFinal;
      clearInterval(intervalo);
    } else {
      valorAtual++;
      elemento.textContent = valorAtual;
    }
  }, 35);
}

const animacaoPadrao = {
  duration: 1800,
  easing: "easeOutQuart"
};

new Chart(document.getElementById("graficoSituacao"), {
  type: "bar",
  data: {
    labels: [
      "Recebidas",
      "Em análise",
      "Encaminhadas",
      "Monitoramento",
      "Resolvidas",
      "Arquivadas"
    ],
    datasets: [{
      label: "Denúncias",
      data: [
        recebidas,
        analise,
        encaminhadas,
        monitoramento,
        resolvidas,
        arquivadas
      ],
      borderWidth: 1,
      borderRadius: 8
    }]
  },
  options: {
    responsive: true,
    animation: animacaoPadrao,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

new Chart(document.getElementById("graficoPizza"), {
  type: "pie",
  data: {
    labels: [
      "Recebida",
      "Em análise",
      "Encaminhada",
      "Em monitoramento",
      "Resolvida",
      "Arquivada"
    ],
    datasets: [{
      data: [
        recebidas,
        analise,
        encaminhadas,
        monitoramento,
        resolvidas,
        arquivadas
      ],
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1800,
      easing: "easeOutQuart"
    }
  }
});

const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const dadosPorMes = meses.map(mes => {
  return denuncias.filter(item => item.mes === mes).length;
});

new Chart(document.getElementById("graficoLinha"), {
  type: "line",
  data: {
    labels: meses,
    datasets: [{
      label: "Denúncias por mês",
      data: dadosPorMes,
      tension: 0.4,
      fill: true,
      pointRadius: 5,
      pointHoverRadius: 8
    }]
  },
  options: {
    responsive: true,
    animation: animacaoPadrao,
    plugins: {
      legend: {
        display: true
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

const map = L.map("map").setView([-3.3836, -57.7186], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

const unidadesMapa = [
  {
    nome: "UBS Aracy",
    coords: [-3.3798, -57.7201],
    denuncias: 2
  },
  {
    nome: "UBS Jorge Brito",
    coords: [-3.3872, -57.7148],
    denuncias: 2
  },
  {
    nome: "Hospital",
    coords: [-3.3836, -57.7186],
    denuncias: 2
  },
  {
    nome: "UBS Maresia",
    coords: [-3.3901, -57.7225],
    denuncias: 2
  }
];

unidadesMapa.forEach((unidade, index) => {
  setTimeout(() => {
    L.marker(unidade.coords)
      .addTo(map)
      .bindPopup(`
        <strong>${unidade.nome}</strong><br>
        Denúncias: ${unidade.denuncias}
      `);
  }, index * 350);
});