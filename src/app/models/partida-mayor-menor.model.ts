export interface PartidaMayorMenor {
  id: string;
  user_id: string;
  nombre_usuario: string;
  cartas_acertadas: number;
  cartas_jugadas: number;
  tiempo_segundos: number;
  gano: boolean;
  finalizado_en: string;
}

export interface PartidaMayorMenorInsert {
  user_id: string;
  nombre_usuario: string;
  cartas_acertadas: number;
  cartas_jugadas: number;
  tiempo_segundos: number;
  gano: boolean;
}
