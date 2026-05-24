export interface PartidaAhorcado {
  id: string;
  user_id: string;
  nombre_usuario: string;
  palabra: string;
  gano: boolean;
  tiempo_segundos: number;
  cantidad_letras_seleccionadas: number;
  intentos_fallidos: number;
  finalizado_en: string;
  created_at: string;
}

export interface PartidaAhorcadoInsert {
  user_id: string;
  nombre_usuario: string;
  palabra: string;
  gano: boolean;
  tiempo_segundos: number;
  cantidad_letras_seleccionadas: number;
  intentos_fallidos: number;
}
