export type RecomendacionEncuesta = 'definitivo' | 'tal-vez' | 'no';

export interface EncuestaInsert {
  user_id: string;
  nombre_usuario: string;
  nombre: string;
  apellido: string;
  edad: number;
  telefono: string;
  juego_favorito: string;
  cosas_que_gustaron: string[];
  recomendacion: RecomendacionEncuesta;
  comentario: string;
}

export interface Encuesta extends EncuestaInsert {
  id: string;
  enviado_en: string;
}
