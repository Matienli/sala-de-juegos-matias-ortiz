import type { Naipe } from '../models/naipe.model';

export function rutaImagenNaipe(naipe: Naipe): string {
  const valor = naipe.valor < 10 ? `0${naipe.valor}` : String(naipe.valor);
  return `/cartas/${valor}-${naipe.palo}.png`;
}
