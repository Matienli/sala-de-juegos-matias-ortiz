export interface PartidaMayorMenorInsert {
  user_id: string;
  nombre_usuario: string;
  cartas_acertadas: number;
  cartas_jugadas: number;
  tiempo_segundos: number;
  gano: boolean;
}
