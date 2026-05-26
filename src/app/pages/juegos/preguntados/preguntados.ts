import { NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MessageModal } from '../../../components/message-modal/message-modal';
import type { OpcionPreguntados, PreguntaPreguntados } from '../../../models/pregunta-preguntados.model';
import { PreguntadosApiService } from '../../../services/preguntados-api.service';
import { PreguntadosPartidasService } from '../../../services/preguntados-partidas.service';
import { AuthService } from '../../../services/auth';

const PREGUNTAS_POR_PARTIDA = 10;
const PAUSA_ENTRE_PREGUNTAS_MS = 1400;
const VIDAS_INICIALES = 2;

@Component({
  selector: 'app-preguntados',
  imports: [RouterLink, NgClass, MessageModal],
  templateUrl: './preguntados.html',
  styleUrl: './preguntados.css',
})
export class Preguntados implements OnInit {
  private readonly api = inject(PreguntadosApiService);
  private readonly partidas = inject(PreguntadosPartidasService);
  readonly auth = inject(AuthService);

  private preguntas: PreguntaPreguntados[] = [];
  private indice = 0;
  private inicioMs = 0;
  private partidaPersistida = false;
  private avanceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly cargando = signal(true);
  readonly partidaTerminada = signal(false);
  readonly respondiendo = signal(false);
  readonly aciertos = signal(0);
  readonly indiceActual = signal(0);
  readonly totalPreguntas = signal(0);
  readonly opcionElegida = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly partidaGuardada = signal(false);
  readonly vidas = signal(VIDAS_INICIALES);
  readonly vidasIniciales = VIDAS_INICIALES;
  readonly perdioPorVidas = signal(false);

  readonly errores = computed(() => this.vidasIniciales - this.vidas());

  readonly modalOpen = signal(false);
  readonly modalTitle = signal('');
  readonly modalBody = signal('');

  readonly preguntaActual = computed(() => this.preguntas[this.indiceActual()] ?? null);
  readonly progresoTexto = computed(() => {
    const total = this.totalPreguntas();
    if (total === 0) {
      return '';
    }
    return `Pregunta ${this.indiceActual() + 1} de ${total}`;
  });

  ngOnInit(): void {
    void this.iniciarPartida();
  }

  async iniciarPartida(): Promise<void> {
    if (this.avanceTimer !== null) {
      clearTimeout(this.avanceTimer);
      this.avanceTimer = null;
    }

    this.cargando.set(true);
    this.partidaTerminada.set(false);
    this.respondiendo.set(false);
    this.aciertos.set(0);
    this.indiceActual.set(0);
    this.opcionElegida.set(null);
    this.partidaGuardada.set(false);
    this.partidaPersistida = false;
    this.vidas.set(VIDAS_INICIALES);
    this.perdioPorVidas.set(false);

    const { preguntas, error } = await this.api.obtenerPreguntas(PREGUNTAS_POR_PARTIDA);
    this.cargando.set(false);

    if (error || preguntas.length === 0) {
      this.mostrarError(error ?? 'No hay preguntas disponibles.');
      return;
    }

    this.preguntas = preguntas;
    this.indice = 0;
    this.totalPreguntas.set(preguntas.length);
    this.inicioMs = Date.now();
  }

  elegirOpcion(opcion: OpcionPreguntados): void {
    if (this.partidaTerminada() || this.respondiendo() || this.cargando()) {
      return;
    }

    this.respondiendo.set(true);
    this.opcionElegida.set(opcion.texto);
    if (opcion.correcta) {
      this.aciertos.update((n) => n + 1);
    } else {
      this.vidas.update((v) => Math.max(0, v - 1));
    }

    const sinVidas = this.vidas() <= 0;

    this.avanceTimer = window.setTimeout(() => {
      this.avanceTimer = null;
      this.opcionElegida.set(null);
      this.respondiendo.set(false);

      if (sinVidas) {
        this.perdioPorVidas.set(true);
        void this.finalizarPartida();
        return;
      }

      this.indice += 1;

      if (this.indice >= this.preguntas.length) {
        void this.finalizarPartida();
        return;
      }

      this.indiceActual.set(this.indice);
    }, PAUSA_ENTRE_PREGUNTAS_MS);
  }

  estadoOpcion(opcion: OpcionPreguntados): 'normal' | 'correcta' | 'incorrecta' | 'revelada' {
    const elegida = this.opcionElegida();
    if (!this.respondiendo() || elegida === null) {
      return 'normal';
    }
    if (opcion.correcta) {
      return 'correcta';
    }
    if (opcion.texto === elegida) {
      return 'incorrecta';
    }
    return 'revelada';
  }

  etiquetaDificultad(dificultad: string): string {
    const mapa: Record<string, string> = {
      easy: 'Fácil',
      medium: 'Media',
      hard: 'Difícil',
    };
    return mapa[dificultad] ?? dificultad;
  }

  cerrarModal(): void {
    this.modalOpen.set(false);
  }

  private async finalizarPartida(): Promise<void> {
    this.partidaTerminada.set(true);
    this.indiceActual.set(this.preguntas.length);
    await this.persistirPartida();
  }

  private async persistirPartida(): Promise<void> {
    if (this.partidaPersistida) {
      return;
    }
    this.partidaPersistida = true;
    this.guardando.set(true);

    const tiempoSegundos = Math.max(1, Math.round((Date.now() - this.inicioMs) / 1000));
    const { error } = await this.partidas.guardarPartida({
      preguntas_totales: this.totalPreguntas(),
      preguntas_acertadas: this.aciertos(),
      tiempo_segundos: tiempoSegundos,
    });

    this.guardando.set(false);
    if (error) {
      this.mostrarError(error);
      return;
    }
    this.partidaGuardada.set(true);
  }

  private mostrarError(mensaje: string): void {
    this.modalTitle.set('Preguntados');
    this.modalBody.set(mensaje);
    this.modalOpen.set(true);
  }
}
