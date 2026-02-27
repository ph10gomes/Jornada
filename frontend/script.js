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

        popularFiltros(dados);
        registrarEventos();
        atualizarTudo();
    } catch (e) {
        console.error("Erro ao carregar dados:", e);
    }
}

/* ================== FILTROS ================== */
function popularFiltros(dados) {
    preencherSelect("filtroUO", extrairUnicos(dados, "COD_UO"), "GERAL");
    preencherSelect("filtroSupervisor", extrairUnicos(dados, "SUPERVISOR_EQUIPE"), "TODOS");
    preencherSelect("filtroLider", extrairUnicos(dados, "LIDER_CONTROLADOR"), "TODOS");
    preencherSelect("filtroControlador", extrairUnicos(dados, "NOME_CONTROLADOR"), "TODOS");
    preencherSelect("filtroTurno", extrairUnicos(dados, "HORA"), "TODOS");
}

function registrarEventos() {
    ["filtroUO","filtroSupervisor","filtroLider","filtroControlador","filtroTurno"]
        .forEach(id => document.getElementById(id).addEventListener("change", atualizarTudo));

    document.getElementById("kpiTotalEqpDia").onclick = () => ativarKpi("TOTAL");
    document.getElementById("kpiTotalEqpDDia").onclick = () => ativarKpi("D");
    document.getElementById("kpiEqpAtivas").onclick = () => ativarKpi("NAO_INICIADA");
    document.getElementById("kpiTotalEqpEfetivaDia").onclick = () => ativarKpi("EFETIVA");
}

function ativarKpi(tipo) {
    filtroKpiAtivo = tipo;
    document.querySelectorAll(".kpi-item").forEach(k => k.classList.remove("ativa"));
    event.target.closest(".kpi-item").classList.add("ativa");
    preencherTabela();
}

/* ================== FILTRO GERAL ================== */
function aplicarFiltros() {
    return dados.filter(l =>
        (!valor("filtroUO") || l.COD_UO == valor("filtroUO")) &&
        (!valor("filtroSupervisor") || l.SUPERVISOR_EQUIPE == valor("filtroSupervisor")) &&
        (!valor("filtroLider") || l.LIDER_CONTROLADOR == valor("filtroLider")) &&
        (!valor("filtroControlador") || l.NOME_CONTROLADOR == valor("filtroControlador")) &&
        (!valor("filtroTurno") || l.HORA == valor("filtroTurno"))
    );
}

/* ================== TABELA ================== */
function preencherTabela() {
    const tbody = document.getElementById("tbodyTabela");
    tbody.innerHTML = "";

    let lista = aplicarFiltros();

    if (filtroKpiAtivo === "D")
        lista = lista.filter(l => l.COD_CLASSIFICACAO_DINAMICO === "D");

    if (filtroKpiAtivo === "NAO_INICIADA")
        lista = lista.filter(l => !l.INICIO_JORNADA);

    if (filtroKpiAtivo === "EFETIVA")
        lista = lista.filter(l => l.INICIO_JORNADA);

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
            <td>${hora(l.INICIO_REFEICAO)}</td>
            <td>${hora(l.TERMINO_REFEICAO)}</td>
            <td class="${classe(l.STATUS_REFEICAO)}">${l.STATUS_REFEICAO || ""}</td>
            <td>${hora(l.ULTIMO_ATENDIMENTO)}</td>
            <td class="${classe(l.STATUS_FINAL)}">${l.STATUS_FINAL || ""}</td>
            <td>${l.JORNADA || ""}</td>
            <td class="${classe(l.STATUS_JORNADA)}">${l.STATUS_JORNADA || ""}</td>
            <td></td>
        </tr>`;
    });
}

/* ================== KPIs ================== */
function atualizarTudo() {
    const lista = aplicarFiltros();

    const equipes = [...new Set(lista.map(l => l.NOME_EQUIPE))];
    const d = lista.filter(l => l.COD_CLASSIFICACAO_DINAMICO === "D");

    document.getElementById("kpiTotalEqpDia").textContent = equipes.length;
    document.getElementById("kpiTotalEqpDDia").textContent = new Set(d.map(l => l.NOME_EQUIPE)).size;
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
function preencherSelect(id, lista, label) {
    const s = document.getElementById(id);
    s.innerHTML = `<option value="">${label}</option>`;
    lista.forEach(v => s.innerHTML += `<option value="${v}">${v}</option>`);
}

function extrairUnicos(dados, campo) {
    return [...new Set(dados.map(l => l[campo]).filter(Boolean))];
}

function valor(id) {
    return document.getElementById(id).value;
}

function hora(v) {
    return v ? String(v).substring(0,5) : "";
}

function classe(v) {
    if (!v) return "";
    v = v.toUpperCase();
    if (v.includes("OK") || v.includes("NORMAL")) return "status-normal";
    if (v.includes("NÃO") || v.includes("NAO")) return "status-nao";
    if (v.includes("D") || v.includes("INC")) return "status-inc";
    return "";
}