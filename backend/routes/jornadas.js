const express = require('express');
const router = express.Router();
const db = require('../db/connection');

/* ===============================
   GET /jornadas
   Lista todas as jornadas
   Pode filtrar por data ?data=24/02/2026
================================ */

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        NOME_EQUIPE,
        COD_UO,
        SUPERVISOR_EQUIPE,
        LIDER_CONTROLADOR,
        NOME_CONTROLADOR,
        HORA,

        DATE_FORMAT(STR_TO_DATE(INICIO_JORNADA, '%d/%m/%Y %H:%i'), '%H:%i') AS INICIO_JORNADA,
        DATE_FORMAT(STR_TO_DATE(PRIMEIRO_ATENDIMENTO, '%d/%m/%Y %H:%i'), '%H:%i') AS PRIMEIRO_ATENDIMENTO,
        DATE_FORMAT(STR_TO_DATE(INI_REFEICAO, '%d/%m/%Y %H:%i'), '%H:%i') AS INICIO_REFEICAO,
        DATE_FORMAT(STR_TO_DATE(FIM_REFEICAO, '%d/%m/%Y %H:%i'), '%H:%i') AS TERMINO_REFEICAO,
        DATE_FORMAT(STR_TO_DATE(ULTIMO_ATENDIMENTO, '%d/%m/%Y %H:%i'), '%H:%i') AS ULTIMO_ATENDIMENTO,
        DATE_FORMAT(STR_TO_DATE(FIM_JORNADA, '%d/%m/%Y %H:%i'), '%H:%i') AS FIM_JORNADA,

        STATUS_INICIO,
        STATUS_PRIMEIRO,
        STATUS_REFEICAO,
        STATUS_FINAL,
        STATUS_JORNADA,
        JORNADA,
        data_nova
      FROM jornadas
      LIMIT 5000
    `);

    res.json(rows);
  } catch (error) {
    console.error('Erro no GET /jornadas:', error);
    res.status(500).json({ erro: error.message });
  }
});


/* ===============================
   POST /jornadas
   Insere nova jornada
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