CREATE DATABASE report_jornada;
USE report_jornada;

CREATE TABLE jornadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_equipe VARCHAR(150),
  uo VARCHAR(20),
  supervisor VARCHAR(100),
  lider VARCHAR(100),
  controlador VARCHAR(100),
  turno VARCHAR(20),
  data DATE,

  inicio_jornada TIME,
  status_inicio VARCHAR(30),

  primeiro_atendimento TIME,
  status_primeiro VARCHAR(30),

  inicio_refeicao TIME,
  termino_refeicao TIME,
  status_refeicao VARCHAR(30),

  ultimo_atendimento TIME,
  status_final VARCHAR(30),

  jornada TIME,
  status_jornada VARCHAR(30),
  classificacao_dinamica VARCHAR(5),
  justificativa TEXT
);