export interface OpcionPreguntados {
  texto: string;
  correcta: boolean;
}

export interface PreguntaPreguntados {
  pregunta: string;
  categoria: string;
  dificultad: string;
  opciones: OpcionPreguntados[];
}
