const TOPICS = [
  {
    id: 'libertad_individual',
    label: 'libertad individual',
    subject: 'libertad individual',
    subthemes: ['limites del poder publico', 'autonomia ciudadana', 'garantias legales'],
    tension: 'libertad_individual_vs_intervencion_estatal',
  },
  {
    id: 'igualdad_ante_la_ley',
    label: 'igualdad ante la ley',
    subject: 'igualdad ante la ley',
    subthemes: ['reglas generales', 'privilegios legales', 'trato institucional'],
    tension: 'igualdad_ante_la_ley_vs_privilegios',
  },
  {
    id: 'estado_limitado',
    label: 'Estado limitado',
    subject: 'limites y funciones del Estado',
    subthemes: ['alcance estatal', 'controles institucionales', 'eficacia publica'],
    tension: 'estado_limitado_eficaz_vs_estado_grande_ineficiente',
  },
  {
    id: 'instituciones_publicas',
    label: 'instituciones publicas',
    subject: 'instituciones publicas',
    subthemes: ['rendicion de cuentas', 'confianza institucional', 'reglas de decision'],
    tension: 'instituciones_fuertes_vs_captura_del_poder',
  },
  {
    id: 'mercado_libre',
    label: 'mercado libre',
    subject: 'competencia y mercado',
    subthemes: ['competencia abierta', 'barreras de entrada', 'consumidores'],
    tension: 'competencia_vs_mercantilismo',
  },
  {
    id: 'emprendimiento',
    label: 'emprendimiento',
    subject: 'emprendimiento',
    subthemes: ['formalizacion', 'burocracia', 'nuevos negocios'],
    tension: 'emprendimiento_vs_burocracia',
  },
  {
    id: 'propiedad_privada',
    label: 'propiedad privada',
    subject: 'propiedad privada',
    subthemes: ['seguridad juridica', 'uso de bienes', 'garantias patrimoniales'],
    tension: 'propiedad_privada_vs_arbitrariedad_estatal',
  },
  {
    id: 'desregulacion',
    label: 'desregulacion',
    subject: 'simplificacion regulatoria',
    subthemes: ['tramites', 'costos regulatorios', 'evaluacion normativa'],
    tension: 'emprendimiento_vs_burocracia',
  },
  {
    id: 'responsabilidad_fiscal',
    label: 'responsabilidad fiscal',
    subject: 'responsabilidad fiscal',
    subthemes: ['gasto publico', 'deuda', 'prioridades presupuestales'],
    tension: 'responsabilidad_fiscal_vs_gasto_politico',
  },
  {
    id: 'anticorrupcion',
    label: 'anticorrupcion',
    subject: 'lucha contra la corrupcion',
    subthemes: ['transparencia', 'compras publicas', 'sanciones'],
    tension: 'ciudadano_vs_poder_politico',
  },
  {
    id: 'anti_mercantilismo',
    label: 'anti mercantilismo',
    subject: 'privilegios economicos otorgados por el Estado',
    subthemes: ['competencia', 'subsidios selectivos', 'captura regulatoria'],
    tension: 'competencia_vs_mercantilismo',
  },
  {
    id: 'seguridad_ciudadana',
    label: 'seguridad ciudadana',
    subject: 'seguridad ciudadana',
    subthemes: ['prevencion', 'control del delito', 'garantias ciudadanas'],
    tension: 'seguridad_ciudadana_vs_arbitrariedad',
  },
  {
    id: 'estado_de_derecho',
    label: 'Estado de derecho',
    subject: 'Estado de derecho',
    subthemes: ['debido proceso', 'cumplimiento de normas', 'independencia institucional'],
    tension: 'instituciones_fuertes_vs_captura_del_poder',
  },
  {
    id: 'merito_y_talento',
    label: 'merito y talento',
    subject: 'merito en el sector publico',
    subthemes: ['servicio civil', 'evaluacion de desempeno', 'nombramientos'],
    tension: 'merito_vs_clientelismo',
  },
  {
    id: 'ciudadania_y_control_del_poder',
    label: 'ciudadania y control del poder',
    subject: 'control ciudadano del poder',
    subthemes: ['fiscalizacion ciudadana', 'acceso a informacion', 'responsabilidad politica'],
    tension: 'ciudadania_activa_vs_poder_sin_control',
  },
  {
    id: 'innovacion_y_competitividad',
    label: 'innovacion y competitividad',
    subject: 'innovacion y competitividad',
    subthemes: ['competitividad', 'reglas para innovar', 'productividad'],
    tension: 'emprendimiento_vs_burocracia',
  },
];

function getTopic(topicId) {
  return TOPICS.find((topic) => topic.id === topicId);
}

module.exports = { TOPICS, getTopic };
