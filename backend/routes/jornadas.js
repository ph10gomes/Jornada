const express = require('express');
const router = express.Router();
const db = require('../db/connection');

/* ===============================
   GET /jornadas
   Busca jornadas do dia atual
================================ */
router.get('/', async (req, res) => {
  try {
    const data = req.query.data || new Date().toISOString().split('T')[0];

    const [rows] = await db.query(
      "SELECT * FROM jornadas WHERE DATA = ?",
      [data]
    );

    res.json(rows);
  } catch (err) {
    console.error('Erro no GET /jornadas:', err);
    res.status(500).json({ erro: 'Erro ao buscar jornadas' });
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

  } catch (err) {
    console.error('Erro no POST /jornadas:', err);
    res.status(500).json({ erro: 'Erro ao inserir jornada' });
  }
});

module.exports = router;