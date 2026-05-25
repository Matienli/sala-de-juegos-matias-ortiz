export interface PartidaClickRapido {
  id: string;
  user_id: string;
  nombre_usuario: string;
  mejor_tiempo_ms: number;
  promedio_tiempo_ms: number;
  cantidad_rondas: number;
  tiempo_total_segundos: number;
  finalizado_en: string;
}

export interface PartidaClickRapidoInsert {
  user_id: string;
  nombre_usuario: string;
  mejor_tiempo_ms: number;
  promedio_tiempo_ms: number;
  cantidad_rondas: number;
  tiempo_total_segundos: number;
}
