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
    description:
      'Desafío de reflejos en el que un objetivo aparece en pantalla de forma imprevista. Tenés que hacer clic lo más rápido posible: el juego mide tu reacción en milisegundos.',
    rules: [
      'Cada partida tiene 5 rondas válidas.',
      'Esperá a que aparezca el botón naranja; no hagas clic antes (si lo hacés, repetís la ronda).',
      'Solo vale el clic sobre el botón «¡Acá!»; si tocás la zona naranja al lado, fallaste y repetís.',
      'El objetivo aparece en una posición distinta en cada ronda.',
      'Gana quien logre el menor tiempo de reacción; también se guarda el promedio de la partida.',
      'Al terminar las 5 rondas, la partida se guarda en la base de datos con tu mejor tiempo y tu promedio.',
    ],
    whyChosen:
      'Elegí un desafío de reflejos porque es simple, divertido y distinto al ahorcado, al mayor o menor y a preguntados: acá no hay palabras ni cartas, solo velocidad de reacción medida en milisegundos.',
    howToPlay: [
      'Entrá a Click rápido desde el inicio (con sesión iniciada) y presioná «Empezar partida».',
      'Mirá la zona de juego: verás «Esperá…» hasta que aparezca el botón «¡Acá!».',
      'Hacé clic en el botón en cuanto lo veas.',
      'Repetí el proceso hasta completar 5 rondas y revisá tu mejor tiempo y tu promedio.',
    ],
  } satisfies OwnGameInfo,
};
