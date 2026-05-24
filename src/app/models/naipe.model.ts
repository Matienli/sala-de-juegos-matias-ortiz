export type Palo = 'oros' | 'copas' | 'espadas' | 'bastos';

export interface Naipe {
  palo: Palo;
  valor: number;
}

export function etiquetaValor(valor: number): string {
  switch (valor) {
    case 1:
      return 'As';
    case 10:
      return 'Sota';
    case 11:
      return 'Caballo';
    case 12:
      return 'Rey';
    default:
      return String(valor);
  }
}

export function etiquetaNaipe(naipe: Naipe): string {
  return `${etiquetaValor(naipe.valor)} de ${naipe.palo}`;
}

export function simboloPalo(palo: Palo): string {
  switch (palo) {
    case 'oros':
      return '♦';
    case 'copas':
      return '♥';
    case 'espadas':
      return '♠';
    case 'bastos':
      return '♣';
  }
}

export function paloEsRojo(palo: Palo): boolean {
  return palo === 'oros' || palo === 'copas';
}
