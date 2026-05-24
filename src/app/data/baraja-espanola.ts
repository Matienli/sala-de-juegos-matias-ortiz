import type { Naipe, Palo } from '../models/naipe.model';

const PALOS: readonly Palo[] = ['oros', 'copas', 'espadas', 'bastos'];
const VALORES = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12] as const;

export function crearBarajaEspanola(): Naipe[] {
  const baraja: Naipe[] = [];
  for (const palo of PALOS) {
    for (const valor of VALORES) {
      baraja.push({ palo, valor });
    }
  }
  return baraja;
}

export function barajarNaipes(baraja: Naipe[]): Naipe[] {
  const copia = [...baraja];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
