let dados = [];
let filtroKpiAtivo = null;

document.addEventListener("DOMContentLoaded", () => {
  carregarDados();
});

/* ================== CARREGAR DADOS DA API ================== */
async function carregarDados() {
  try {
    const res = await fetch("http://localhost:3000/jornadas");
    dados = await res.json();

    popularFiltrosIniciais();
    registrarEventos();
    atualizarTudo();
  } catch (e) {
    console.error("Erro ao carregar dados:", e);
  }
}

/* ================== FILTROS (INICIAL) ================== */
function popularFiltrosIniciais() {
  preencherSelect("filtroUO", extrairUnicos(dados, "COD_UO"), "GERAL");
  preencherSelect("filtroSupervisor", extrairUnicos(dados, "SUPERVISOR_EQUIPE"), "TODOS");
  preencherSelect("filtroLider", extrairUnicos(dados, "LIDER_CONTROLADOR"), "TODOS");
  preencherSelect("filtroControlador", extrairUnicos(dados, "NOME_CONTROLADOR"), "TODOS");
  preencherSelect("filtroTurno", extrairUnicos(dados, "HORA"), "TODOS");
}

/* ================== EVENTOS ================== */
function registrarEventos() {
  // filtros
  ["filtroUO", "filtroSupervisor", "filtroLider", "filtroControlador", "filtroTurno"]
    .forEach(id => document.getElementById(id).addEventListener("change", () => {
      atualizarFiltrosCascata();
      atualizarTudo();
    }));

  // KPIs clicáveis (mantém o comportamento do seu código original)
  bindKpi("kpiTotalEqpDia", "TOTAL");
  bindKpi("kpiTotalEqpDDia", "D");
  bindKpi("kpiEqpAtivas", "NAO_INICIADA");
  bindKpi("kpiTotalEqpEfetivaDia", "EFETIVA");
}

function bindKpi(idNumeroKpi, tipo) {
  const elNumero = document.getElementById(idNumeroKpi);
  if (!elNumero) return;

  const card = elNumero.closest(".kpi-item") || elNumero; // pega o card inteiro
  card.style.cursor = "pointer";

  card.addEventListener("click", () => {
    ativarKpi(tipo, card);
  });
}

/* ================== KPI ================== */
function ativarKpi(tipo, cardClicado) {
  // toggle (clicar de novo desativa)
  filtroKpiAtivo = (filtroKpiAtivo === tipo) ? null : tipo;

  // remove classe de todas
  document.querySelectorAll(".kpi-item").forEach(k => k.classList.remove("ativa"));

  // aplica classe na clicada se estiver ativa
  if (filtroKpiAtivo && cardClicado?.classList) {
    cardClicado.classList.add("ativa");
  }

  preencherTabela(); // igual seu original: KPI afeta a tabela
}

/* ================== CASCATA ================== */
function atualizarFiltrosCascata() {
  // respeita os filtros atuais e recalcula opções
  const lista = aplicarFiltros();

  // mantém valor selecionado quando ainda existir
  preencherSelect("filtroSupervisor", extrairUnicos(lista, "SUPERVISOR_EQUIPE"), "TODOS", true);
  preencherSelect("filtroLider", extrairUnicos(lista, "LIDER_CONTROLADOR"), "TODOS", true);
  preencherSelect("filtroControlador", extrairUnicos(lista, "NOME_CONTROLADOR"), "TODOS", true);
  preencherSelect("filtroTurno", extrairUnicos(lista, "HORA"), "TODOS", true);
}

/* ================== FILTRO GERAL ================== */
function aplicarFiltros() {
  return dados.filter(l =>
    (!valor("filtroUO") || l.COD_UO == valor("filtroUO")) &&
    (!valor("filtroSupervisor") || l.SUPERVISOR_EQUIPE == valor("filtroSupervisor")) &&
    (!valor("filtroLider") || l.LIDER_CONTROLADOR == valor("filtroLider")) &&
    (!valor("filtroControlador") || l.NOME_CONTROLADOR == valor("filtroControlador")) &&
    (!valor("filtroTurno") || String(l.HORA) == String(valor("filtroTurno")))
  );
}

/* ================== TABELA ================== */
function preencherTabela() {
  const tbody = document.getElementById("tbodyTabela");
  tbody.innerHTML = "";

  let lista = aplicarFiltros();

  // filtros por KPI (mantém sua lógica original)
  if (filtroKpiAtivo === "D")
    lista = lista.filter(l => l.COD_CLASSIFICACAO_DINAMICO === "D");

  if (filtroKpiAtivo === "NAO_INICIADA")
    lista = lista.filter(l => !l.INICIO_JORNADA);

  if (filtroKpiAtivo === "EFETIVA")
    lista = lista.filter(l => !!l.INICIO_JORNADA);

  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="13">Nenhum registro</td></tr>`;
    return;
  }

  lista.forEach(l => {
    tbody.innerHTML += `
      <tr>
        <td>${l.NOME_EQUIPE || ""}</td>
        <td>${hora(l.INICIO_JORNADA)}</td>
        <td class="${classe(l.STATUS_INICIO)}">${l.STATUS_INICIO || ""}</td>
        <td>${hora(l.PRIMEIRO_ATENDIMENTO)}</td>
        <td class="${classe(l.STATUS_PRIMEIRO)}">${l.STATUS_PRIMEIRO || ""}</td>
        <td>${hora(l.INICIO_REFEICAO || l.INI_REFEICAO)}</td>
        <td>${hora(l.TERMINO_REFEICAO || l.FIM_REFEICAO)}</td>
        <td class="${classe(l.STATUS_REFEICAO)}">${l.STATUS_REFEICAO || ""}</td>
        <td>${hora(l.ULTIMO_ATENDIMENTO)}</td>
        <td class="${classe(l.STATUS_FINAL)}">${l.STATUS_FINAL || ""}</td>
        <td>${l.JORNADA || ""}</td>
        <td class="${classe(l.STATUS_JORNADA)}">${l.STATUS_JORNADA || ""}</td>
        <td></td>
      </tr>
    `;
  });
}

/* ================== KPIs ================== */
function atualizarTudo() {
  const lista = aplicarFiltros();

  const equipes = [...new Set(lista.map(l => l.NOME_EQUIPE).filter(Boolean))];
  const d = lista.filter(l => l.COD_CLASSIFICACAO_DINAMICO === "D");

  document.getElementById("kpiTotalEqpDia").textContent = equipes.length;

  document.getElementById("kpiTotalEqpDDia").textContent =
    new Set(d.map(l => l.NOME_EQUIPE)).size;

  document.getElementById("kpiPercEqpD").textContent =
    equipes.length ? ((d.length / equipes.length) * 100).toFixed(1) + "%" : "0%";

  const naoIniciadas = equipes.filter(eq =>
    !lista.some(l => l.NOME_EQUIPE === eq && l.INICIO_JORNADA)
  );

  document.getElementById("kpiEqpAtivas").textContent = naoIniciadas.length;

  document.getElementById("kpiTotalEqpEfetivaDia").textContent =
    equipes.length - naoIniciadas.length;

  preencherTabela();
}

/* ================== HELPERS ================== */
function preencherSelect(id, lista, label, preservar = false) {
  const s = document.getElementById(id);
  const anterior = s.value;

  s.innerHTML = `<option value="">${label}</option>`;
  lista.forEach(v => s.innerHTML += `<option value="${v}">${v}</option>`);

  if (preservar && lista.includes(anterior)) {
    s.value = anterior;
  }
}

function extrairUnicos(dados, campo) {
  return [...new Set(dados.map(l => l[campo]).filter(v => v !== null && v !== undefined && v !== ""))];
}

function valor(id) {
  return document.getElementById(id).value;
}

// ✅ Corrigida: extrai HH:MM de "24/02/2026 05:06" ou retorna HH:MM se já vier assim
function hora(v) {
  if (!v) return "";
  const s = String(v);
  const m = s.match(/\b(\d{2}):(\d{2})\b/);
  return m ? `${m[1]}:${m[2]}` : "";
}

function classe(v) {
  if (!v) return "";
  v = String(v).toUpperCase();
  if (v.includes("OK") || v.includes("NORMAL")) return "status-normal";
  if (v.includes("NÃO") || v.includes("NAO")) return "status-nao";
  if (v.includes("D") || v.includes("INC")) return "status-inc";
  return "";
}