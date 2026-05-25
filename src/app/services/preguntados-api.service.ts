import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { GEOGRAFIA_ES } from '../data/preguntados-geografia';
import type { OpcionPreguntados, PreguntaPreguntados } from '../models/pregunta-preguntados.model';

/**
 * REST Countries — listada en https://github.com/public-apis/public-apis (Geography → REST Countries).
 * Se cruzan los datos de la API con nombres y capitales en español definidos en `preguntados-geografia.ts`.
 */
const API_URL = 'https://restcountries.com/v3.1/all';

interface RestCountry {
  cca2: string;
  capital?: string[];
}

interface PaisCapitales {
  nombre: string;
  capital: string;
}

const DIFICULTADES = ['easy', 'medium', 'hard'] as const;

@Injectable({
  providedIn: 'root',
})
export class PreguntadosApiService {
  private readonly http = inject(HttpClient);
  private paisesCache: PaisCapitales[] | null = null;

  async obtenerPreguntas(cantidad: number): Promise<{ preguntas: PreguntaPreguntados[]; error: string | null }> {
    const total = Math.min(15, Math.max(5, cantidad));
    try {
      const paises = await this.cargarPaises();
      if (paises.length < 8) {
        return { preguntas: [], error: 'No hay suficientes países para armar la partida.' };
      }

      const preguntas = this.generarPreguntas(paises, total);
      return { preguntas, error: null };
    } catch {
      return {
        preguntas: [],
        error: 'No se pudo conectar con REST Countries. Revisá tu conexión.',
      };
    }
  }

  private async cargarPaises(): Promise<PaisCapitales[]> {
    if (this.paisesCache) {
      return this.paisesCache;
    }

    const data = await firstValueFrom(
      this.http.get<RestCountry[]>(API_URL, {
        params: { fields: 'cca2,capital' },
      }),
    );

    const paises: PaisCapitales[] = [];

    for (const item of data) {
      const codigo = item.cca2?.toUpperCase();
      if (!codigo || !item.capital?.[0]?.trim()) {
        continue;
      }
      const es = GEOGRAFIA_ES[codigo];
      if (!es) {
        continue;
      }
      paises.push({ nombre: es.nombre, capital: es.capital });
    }

    this.paisesCache = paises;
    return paises;
  }

  private generarPreguntas(paises: PaisCapitales[], cantidad: number): PreguntaPreguntados[] {
    const barajados = [...paises].sort(() => Math.random() - 0.5);
    const elegidos = barajados.slice(0, cantidad);
    return elegidos.map((pais) => this.crearPregunta(pais, paises));
  }

  private crearPregunta(pais: PaisCapitales, todos: PaisCapitales[]): PreguntaPreguntados {
    const dificultad = DIFICULTADES[Math.floor(Math.random() * DIFICULTADES.length)];
    const preguntaCapital = Math.random() < 0.5;

    if (preguntaCapital) {
      const distractores = this.elegirCapitalesIncorrectas(pais, todos, 3);
      return {
        pregunta: `¿Cuál es la capital de ${pais.nombre}?`,
        categoria: 'Geografía',
        dificultad,
        opciones: mezclarOpciones(pais.capital, distractores),
      };
    }

    const distractores = this.elegirNombresIncorrectos(pais, todos, 3);
    return {
      pregunta: `¿De qué país es la capital ${pais.capital}?`,
      categoria: 'Geografía',
      dificultad,
      opciones: mezclarOpciones(pais.nombre, distractores),
    };
  }

  private elegirCapitalesIncorrectas(
    pais: PaisCapitales,
    todos: PaisCapitales[],
    cantidad: number,
  ): string[] {
    const pool = todos.filter((p) => p.capital !== pais.capital).map((p) => p.capital);
    return elegirAlAzar(pool, cantidad);
  }

  private elegirNombresIncorrectos(pais: PaisCapitales, todos: PaisCapitales[], cantidad: number): string[] {
    const pool = todos.filter((p) => p.nombre !== pais.nombre).map((p) => p.nombre);
    return elegirAlAzar(pool, cantidad);
  }
}

function elegirAlAzar<T>(lista: T[], cantidad: number): T[] {
  const copia = [...lista];
  const resultado: T[] = [];
  while (resultado.length < cantidad && copia.length > 0) {
    const i = Math.floor(Math.random() * copia.length);
    const item = copia.splice(i, 1)[0];
    if (!resultado.includes(item)) {
      resultado.push(item);
    }
  }
  return resultado;
}

function mezclarOpciones(correcta: string, incorrectas: string[]): OpcionPreguntados[] {
  const opciones: OpcionPreguntados[] = [
    { texto: correcta, correcta: true },
    ...incorrectas.map((texto) => ({ texto, correcta: false })),
  ];
  for (let i = opciones.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
  }
  return opciones;
}
