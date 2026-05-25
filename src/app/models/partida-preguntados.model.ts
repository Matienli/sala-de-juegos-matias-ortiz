export interface PartidaPreguntados {
  id: string;
  user_id: string;
  nombre_usuario: string;
  preguntas_totales: number;
  preguntas_acertadas: number;
  tiempo_segundos: number;
  finalizado_en: string;
}

export interface PartidaPreguntadosInsert {
  user_id: string;
  nombre_usuario: string;
  preguntas_totales: number;
  preguntas_acertadas: number;
  tiempo_segundos: number;
}
