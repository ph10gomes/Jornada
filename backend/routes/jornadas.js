const express = require('express');
const router = express.Router();
const db = require('../db/connection');

/* ===============================
   GET /jornadas
================================ */
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM jornadas LIMIT 5000");

    const toHHMM = (v) => {
      if (v === undefined || v === null) return "";
      const s = String(v).trim();
      if (!s || s.toLowerCase() === "null") return "";

      const m = s.match(/\b(\d{2}):(\d{2})\b/);
      return m ? `${m[1]}:${m[2]}` : "";
    };

    const pick = (obj, keys) => {
      for (const k of keys) {
        if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== "") {
          return obj[k];
        }
      }
      return "";
    };

    const saida = rows.map((r) => {
      // pega os valores reais (mesmo que o nome varie)
      const inicioRaw = pick(r, ["INICIO_JORNADA", "INICIO", "INI_JORNADA"]);
      const primeiroRaw = pick(r, ["PRIMEIRO_ATENDIMENTO", "PRIMEIRO_ATEND", "PRIMEIRO_ATEN", "PRIMEIRO_ATEND."]);
      const ultimoRaw = pick(r, ["ULTIMO_ATENDIMENTO", "ULTIMO_ATEND", "ULTIMO_ATEN"]);
      const iniRefRaw = pick(r, ["INI_REFEICAO", "INICIO_REFEICAO"]);
      const fimRefRaw = pick(r, ["FIM_REFEICAO", "TERMINO_REFEICAO"]);
      const fimJornadaRaw = pick(r, ["FIM_JORNADA"]);

      // converte para HH:MM (funciona com "24/02/2026 05:06")
      const inicio = toHHMM(inicioRaw);
      const primeiro = toHHMM(primeiroRaw);
      const ultimo = toHHMM(ultimoRaw);
      const iniRef = toHHMM(iniRefRaw);
      const fimRef = toHHMM(fimRefRaw);
      const fimJornada = toHHMM(fimJornadaRaw);

      // ✅ regra: se tem início e NÃO tem 1º atendimento -> ATRASADO
      const semPrimeiro =
        !primeiro ||
        String(primeiro).trim() === "" ||
        String(primeiro).toLowerCase() === "null";

      const statusPrimeiro =
        inicio && semPrimeiro ? "ATRASADO" : (primeiro ? "OK" : "");

      return {
        ...r,

        // garante HH:MM no front
        INICIO_JORNADA: inicio,
        PRIMEIRO_ATENDIMENTO: primeiro,
        INICIO_REFEICAO: iniRef,
        TERMINO_REFEICAO: fimRef,
        ULTIMO_ATENDIMENTO: ultimo,
        FIM_JORNADA: fimJornada,

        // status para pintar no front
        STATUS_INICIO: inicio ? "OK" : "NÃO INICIADA",
        STATUS_PRIMEIRO: statusPrimeiro,                 // ✅ AQUI
        STATUS_REFEICAO: iniRef && fimRef ? "OK" : "",
        STATUS_FINAL: fimJornada ? "OK" : "",
        STATUS_JORNADA: inicio ? "EFETIVA" : "NÃO INICIADA",
      };
    });

    res.json(saida);
  } catch (error) {
    console.error("Erro no GET /jornadas:", error);
    res.status(500).json({ erro: error.message });
  }
});

/* ===============================
   POST /jornadas
================================ */
router.post('/', async (req, res) => {
  try {
    const {
      COD_UO,
      SUPERVISOR_EQUIPE,
      LIDER_CONTROLADOR,
      NOME_CONTROLADOR,
      HORA,
      NOME_EQUIPE,
      INICIO_JORNADA,
      PRIMEIRO_ATENDIMENTO,
      INICIO_REFEICAO,
      TERMINO_REFEICAO,
      ULTIMO_ATENDIMENTO,
      JORNADA,
      DATA_REFERENCIA
    } = req.body;

    const sql = `
      INSERT INTO jornadas (
        COD_UO,
        SUPERVISOR_EQUIPE,
        LIDER_CONTROLADOR,
        NOME_CONTROLADOR,
        HORA,
        NOME_EQUIPE,
        INICIO_JORNADA,
        PRIMEIRO_ATENDIMENTO,
        INICIO_REFEICAO,
        TERMINO_REFEICAO,
        ULTIMO_ATENDIMENTO,
        JORNADA,
        DATA_REFERENCIA
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(sql, [
      COD_UO,
      SUPERVISOR_EQUIPE,
      LIDER_CONTROLADOR,
      NOME_CONTROLADOR,
      HORA,
      NOME_EQUIPE,
      INICIO_JORNADA,
      PRIMEIRO_ATENDIMENTO,
      INICIO_REFEICAO,
      TERMINO_REFEICAO,
      ULTIMO_ATENDIMENTO,
      JORNADA,
      DATA_REFERENCIA
    ]);

    res.status(201).json({ status: 'Jornada inserida com sucesso' });
  } catch (error) {
    console.error('Erro no POST /jornadas:', error);
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;