import { inject, Injectable } from '@angular/core';

import type { PartidaAhorcado } from '../models/partida-ahorcado.model';
import type { PartidaClickRapido } from '../models/partida-click-rapido.model';
import type { PartidaMayorMenor } from '../models/partida-mayor-menor.model';
import type { PartidaPreguntados } from '../models/partida-preguntados.model';
import { AuthService } from './auth';

export interface ResultadosTablas {
  ahorcado: PartidaAhorcado[];
  mayorMenor: PartidaMayorMenor[];
  preguntados: PartidaPreguntados[];
  clickRapido: PartidaClickRapido[];
}

@Injectable({
  providedIn: 'root',
})
export class ResultadosService {
  private readonly auth = inject(AuthService);

  async cargarResultados(): Promise<{ data: ResultadosTablas | null; error: string | null }> {
    const client = this.auth.getSupabaseClient();
    if (!client) {
      return { data: null, error: 'Supabase no está configurado.' };
    }

    const [ahorcadoRes, mayorMenorRes, preguntadosRes, clickRapidoRes] = await Promise.all([
      client.from('partidas_ahorcado').select('*'),
      client.from('partidas_mayor_menor').select('*'),
      client.from('partidas_preguntados').select('*'),
      client.from('partidas_click_rapido').select('*'),
    ]);

    const error =
      ahorcadoRes.error?.message ??
      mayorMenorRes.error?.message ??
      preguntadosRes.error?.message ??
      clickRapidoRes.error?.message ??
      null;

    if (error) {
      return {
        data: null,
        error: 'No se pudieron cargar los resultados. Revisá que existan las tablas en Supabase.',
      };
    }

    return {
      data: {
        ahorcado: ordenarAhorcado((ahorcadoRes.data ?? []) as PartidaAhorcado[]),
        mayorMenor: ordenarMayorMenor((mayorMenorRes.data ?? []) as PartidaMayorMenor[]),
        preguntados: ordenarPreguntados((preguntadosRes.data ?? []) as PartidaPreguntados[]),
        clickRapido: ordenarClickRapido((clickRapidoRes.data ?? []) as PartidaClickRapido[]),
      },
      error: null,
    };
  }
}

function compararAhorcado(a: PartidaAhorcado, b: PartidaAhorcado): number {
  const puntajeA = a.puntaje ?? 0;
  const puntajeB = b.puntaje ?? 0;
  if (puntajeA !== puntajeB) {
    return puntajeB - puntajeA;
  }
  if (a.gano !== b.gano) {
    return a.gano ? -1 : 1;
  }
  return a.tiempo_segundos - b.tiempo_segundos;
}

function compararMayorMenor(a: PartidaMayorMenor, b: PartidaMayorMenor): number {
  if (a.gano !== b.gano) {
    return a.gano ? -1 : 1;
  }
  if (a.cartas_acertadas !== b.cartas_acertadas) {
    return b.cartas_acertadas - a.cartas_acertadas;
  }
  return a.tiempo_segundos - b.tiempo_segundos;
}

function compararPreguntados(a: PartidaPreguntados, b: PartidaPreguntados): number {
  if (a.preguntas_acertadas !== b.preguntas_acertadas) {
    return b.preguntas_acertadas - a.preguntas_acertadas;
  }
  return a.tiempo_segundos - b.tiempo_segundos;
}

function compararClickRapido(a: PartidaClickRapido, b: PartidaClickRapido): number {
  if (a.mejor_tiempo_ms !== b.mejor_tiempo_ms) {
    return a.mejor_tiempo_ms - b.mejor_tiempo_ms;
  }
  return a.promedio_tiempo_ms - b.promedio_tiempo_ms;
}

function ordenarAhorcado(partidas: PartidaAhorcado[]): PartidaAhorcado[] {
  return [...partidas].sort(compararAhorcado);
}

function ordenarMayorMenor(partidas: PartidaMayorMenor[]): PartidaMayorMenor[] {
  return [...partidas].sort(compararMayorMenor);
}

function ordenarPreguntados(partidas: PartidaPreguntados[]): PartidaPreguntados[] {
  return [...partidas].sort(compararPreguntados);
}

function ordenarClickRapido(partidas: PartidaClickRapido[]): PartidaClickRapido[] {
  return [...partidas].sort(compararClickRapido);
}
