import type { OwnGameInfo } from './environment.types';


export const environment = {
  production: true,
  githubUsername: 'Matienli',
  githubApiBaseUrl: 'https://api.github.com',
  ownGame: {
    name: 'Juego sorpresa — Click rápido',
    whyChosen:
      'Elegí un desafío de reflejos porque es simple, divertido y distinto al ahorcado, al mayor o menor y a preguntados: acá no hay palabras ni cartas, solo velocidad de reacción medida en milisegundos.',
    howToPlay: [
      'Iniciá una ronda: aparece un botón o cuadrado en la pantalla (en una posición distinta cada vez).',
      'Hacé clic lo más rápido que puedas en cuanto lo veas.',
      'El juego mide el tiempo entre que aparece el objetivo y tu clic, en milisegundos (ms).',
      'Menor tiempo = mejor marca. Podés repetir para intentar superar tu récord.',
    ],
  } satisfies OwnGameInfo,
};
