import type { OwnGameInfo, QuickLoginAccount } from './environment.types';

export const environment = {
  production: true,
  githubUsername: 'Matienli',
  githubApiBaseUrl: 'https://api.github.com',
  supabaseUrl: 'https://mkvcvjwvidhvlwgvubej.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdmN2and2aWRodmx3Z3Z1YmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxOTgyNTYsImV4cCI6MjA5NDc3NDI1Nn0.sqjlmjc-lC7KoTqYwI3wTzEdEq_DHaGG2QIfX95BN4c',
  quickLoginUsers: [
    { label: 'Tester 1', email: 'tester1@ejemplo.com', password: 'Prueba1!' },
    { label: 'Tester 2', email: 'tester2@ejemplo.com', password: 'Prueba2!' },
    { label: 'Tester 3', email: 'tester3@ejemplo.com', password: 'Prueba3!' },
  ] satisfies QuickLoginAccount[],
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
