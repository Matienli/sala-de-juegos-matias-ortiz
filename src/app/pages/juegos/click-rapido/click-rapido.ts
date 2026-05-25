import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MessageModal } from '../../../components/message-modal/message-modal';
import { ClickRapidoPartidasService } from '../../../services/click-rapido-partidas.service';
import { AuthService } from '../../../services/auth';

const RONDAS_POR_PARTIDA = 5;
const ESPERA_MIN_MS = 1200;
const ESPERA_MAX_MS = 3200;

type Fase = 'inicio' | 'esperando' | 'objetivo' | 'feedback' | 'fin';

@Component({
  selector: 'app-click-rapido',
  imports: [RouterLink, MessageModal],
  templateUrl: './click-rapido.html',
  styleUrl: './click-rapido.css',
})
export class ClickRapido implements OnDestroy {
  private readonly partidas = inject(ClickRapidoPartidasService);
  readonly auth = inject(AuthService);

  private esperaTimer: ReturnType<typeof setTimeout> | null = null;
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;
  private inicioPartidaMs = 0;
  private aparecioObjetivoMs = 0;
  private partidaPersistida = false;

  readonly rondasTotales = RONDAS_POR_PARTIDA;
  readonly fase = signal<Fase>('inicio');
  readonly rondaActual = signal(0);
  readonly tiemposMs = signal<number[]>([]);
  readonly ultimoTiempoMs = signal<number | null>(null);
  readonly mensajeFeedback = signal('');
  readonly objetivoTop = signal(40);
  readonly objetivoLeft = signal(40);
  readonly guardando = signal(false);
  readonly partidaGuardada = signal(false);

  readonly modalOpen = signal(false);
  readonly modalTitle = signal('');
  readonly modalBody = signal('');

  readonly mejorTiempo = signal<number | null>(null);
  readonly promedioTiempo = signal<number | null>(null);
  readonly mejorParcial = computed(() => {
    const tiempos = this.tiemposMs();
    return tiempos.length > 0 ? Math.min(...tiempos) : null;
  });

  ngOnDestroy(): void {
    this.limpiarTimers();
  }

  empezarPartida(): void {
    this.limpiarTimers();
    this.tiemposMs.set([]);
    this.ultimoTiempoMs.set(null);
    this.mensajeFeedback.set('');
    this.partidaGuardada.set(false);
    this.partidaPersistida = false;
    this.mejorTiempo.set(null);
    this.promedioTiempo.set(null);
    this.rondaActual.set(0);
    this.inicioPartidaMs = Date.now();
    this.iniciarRonda();
  }

  onClickZona(event: MouseEvent): void {
    const fase = this.fase();
    if (fase === 'inicio' || fase === 'fin' || fase === 'feedback') {
      return;
    }

    if (fase === 'esperando') {
      this.onClicApurado();
      return;
    }

    if (fase === 'objetivo') {
      const target = event.target as HTMLElement;
      if (target.classList.contains('cr-objetivo') || target.closest('.cr-objetivo')) {
        this.onAcerto();
      } else {
        this.onFalloObjetivo();
      }
    }
  }

  private onClicApurado(): void {
    if (this.esperaTimer !== null) {
      clearTimeout(this.esperaTimer);
      this.esperaTimer = null;
    }
    this.mensajeFeedback.set('¡Muy apurado! Esperá a que aparezca el botón.');
    this.fase.set('feedback');
    this.programarReintento(1200);
  }

  private onFalloObjetivo(): void {
    this.mensajeFeedback.set('¡Fallaste! Tenés que tocar el botón «¡Acá!».');
    this.fase.set('feedback');
    this.programarReintento(1400);
  }

  private onAcerto(): void {
    if (this.fase() !== 'objetivo') {
      return;
    }

    const tiempo = Math.max(1, Date.now() - this.aparecioObjetivoMs);
    this.ultimoTiempoMs.set(tiempo);
    this.tiemposMs.update((lista) => [...lista, tiempo]);
    this.mensajeFeedback.set(`¡${tiempo} ms!`);
    this.fase.set('feedback');

    const completadas = this.tiemposMs().length;
    if (completadas >= RONDAS_POR_PARTIDA) {
      this.programarFin(1400);
      return;
    }
    this.programarSiguienteRonda(1400);
  }

  private iniciarRonda(): void {
    if (this.tiemposMs().length >= RONDAS_POR_PARTIDA) {
      void this.finalizarPartida();
      return;
    }

    this.rondaActual.set(this.tiemposMs().length + 1);
    this.mensajeFeedback.set('');
    this.fase.set('esperando');
    this.colocarObjetivoAleatorio();

    const espera = ESPERA_MIN_MS + Math.floor(Math.random() * (ESPERA_MAX_MS - ESPERA_MIN_MS));
    this.esperaTimer = window.setTimeout(() => {
      this.esperaTimer = null;
      if (this.fase() !== 'esperando') {
        return;
      }
      this.aparecioObjetivoMs = Date.now();
      this.fase.set('objetivo');
    }, espera);
  }

  private colocarObjetivoAleatorio(): void {
    this.objetivoTop.set(15 + Math.floor(Math.random() * 55));
    this.objetivoLeft.set(10 + Math.floor(Math.random() * 55));
  }

  private programarSiguienteRonda(delayMs: number): void {
    this.feedbackTimer = window.setTimeout(() => {
      this.feedbackTimer = null;
      this.iniciarRonda();
    }, delayMs);
  }

  /** Repite la misma ronda (error o clic apurado); no suma intento válido. */
  private programarReintento(delayMs: number): void {
    this.feedbackTimer = window.setTimeout(() => {
      this.feedbackTimer = null;
      this.iniciarRonda();
    }, delayMs);
  }

  private programarFin(delayMs: number): void {
    this.feedbackTimer = window.setTimeout(() => {
      this.feedbackTimer = null;
      void this.finalizarPartida();
    }, delayMs);
  }

  private async finalizarPartida(): Promise<void> {
    const tiempos = this.tiemposMs();
    if (tiempos.length === 0) {
      this.fase.set('inicio');
      return;
    }

    const mejor = Math.min(...tiempos);
    const promedio = Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length);
    this.mejorTiempo.set(mejor);
    this.promedioTiempo.set(promedio);
    this.fase.set('fin');
    await this.persistirPartida(mejor, promedio, tiempos.length);
  }

  private async persistirPartida(
    mejor: number,
    promedio: number,
    rondas: number,
  ): Promise<void> {
    if (this.partidaPersistida) {
      return;
    }
    this.partidaPersistida = true;
    this.guardando.set(true);

    const tiempoSegundos = Math.max(1, Math.round((Date.now() - this.inicioPartidaMs) / 1000));
    const { error } = await this.partidas.guardarPartida({
      mejor_tiempo_ms: mejor,
      promedio_tiempo_ms: promedio,
      cantidad_rondas: rondas,
      tiempo_total_segundos: tiempoSegundos,
    });

    this.guardando.set(false);
    if (error) {
      this.mostrarError(error);
      return;
    }
    this.partidaGuardada.set(true);
  }

  cerrarModal(): void {
    this.modalOpen.set(false);
  }

  private limpiarTimers(): void {
    if (this.esperaTimer !== null) {
      clearTimeout(this.esperaTimer);
      this.esperaTimer = null;
    }
    if (this.feedbackTimer !== null) {
      clearTimeout(this.feedbackTimer);
      this.feedbackTimer = null;
    }
  }

  private mostrarError(mensaje: string): void {
    this.modalTitle.set('Click rápido');
    this.modalBody.set(mensaje);
    this.modalOpen.set(true);
  }
}
