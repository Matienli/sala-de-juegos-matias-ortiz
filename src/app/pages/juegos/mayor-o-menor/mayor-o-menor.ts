import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { barajarNaipes, crearBarajaEspanola } from '../../../data/baraja-espanola';
import { MessageModal } from '../../../components/message-modal/message-modal';
import { NaipeCarta } from '../../../components/naipe-carta/naipe-carta';
import type { Naipe } from '../../../models/naipe.model';
import { MayorMenorPartidasService } from '../../../services/mayor-menor-partidas.service';
import { AuthService } from '../../../services/auth';

type Prediccion = 'mayor' | 'menor';

const VIDAS_INICIALES = 3;

@Component({
  selector: 'app-mayor-o-menor',
  imports: [RouterLink, NaipeCarta, MessageModal],
  templateUrl: './mayor-o-menor.html',
  styleUrl: './mayor-o-menor.css',
})
export class MayorOMenor implements OnInit {
  private readonly partidas = inject(MayorMenorPartidasService);
  readonly auth = inject(AuthService);

  private baraja: Naipe[] = [];
  private indice = 0;
  private inicioMs = 0;
  private partidaPersistida = false;
  private revelacionTimer: ReturnType<typeof setTimeout> | null = null;

  readonly cartaActual = signal<Naipe | null>(null);
  readonly cartaRevelada = signal<Naipe | null>(null);
  readonly aciertos = signal(0);
  readonly intentos = signal(0);
  readonly vidas = signal(VIDAS_INICIALES);
  readonly vidasIniciales = VIDAS_INICIALES;
  readonly partidaTerminada = signal(false);
  readonly gano = signal(false);
  readonly guardando = signal(false);
  readonly partidaGuardada = signal(false);

  readonly modalOpen = signal(false);
  readonly modalTitle = signal('');
  readonly modalBody = signal('');

  readonly mensajeFin = signal('');
  readonly revelando = signal(false);
  readonly juegoActivo = computed(
    () => !this.partidaTerminada() && !this.revelando() && this.cartaActual() !== null,
  );

  readonly errores = computed(() => this.vidasIniciales - this.vidas());

  ngOnInit(): void {
    this.nuevaPartida();
  }

  nuevaPartida(): void {
    if (this.revelacionTimer !== null) {
      clearTimeout(this.revelacionTimer);
      this.revelacionTimer = null;
    }
    this.baraja = barajarNaipes(crearBarajaEspanola());
    this.indice = 0;
    this.cartaActual.set(this.baraja[0]);
    this.cartaRevelada.set(null);
    this.revelando.set(false);
    this.aciertos.set(0);
    this.intentos.set(0);
    this.vidas.set(VIDAS_INICIALES);
    this.partidaTerminada.set(false);
    this.gano.set(false);
    this.partidaGuardada.set(false);
    this.mensajeFin.set('');
    this.partidaPersistida = false;
    this.inicioMs = Date.now();
  }

  elegir(prediccion: Prediccion): void {
    if (!this.juegoActivo()) {
      return;
    }
    const actual = this.cartaActual();
    if (!actual) {
      return;
    }
    if (this.indice >= this.baraja.length - 1) {
      this.finalizarPartida(true, 'Completaste toda la baraja.');
      return;
    }

    const siguiente = this.baraja[this.indice + 1];
    this.revelando.set(true);
    this.cartaRevelada.set(siguiente);

    if (siguiente.valor === actual.valor) {
      this.indice += 1;
      this.revelacionTimer = window.setTimeout(() => {
        this.revelacionTimer = null;
        this.cartaActual.set(siguiente);
        this.cartaRevelada.set(null);
        this.revelando.set(false);
        if (this.indice >= this.baraja.length - 1) {
          void this.finalizarPartida(true, 'Completaste toda la baraja.');
        }
      }, 1400);
      return;
    }

    this.intentos.update((n) => n + 1);

    const acerto =
      (prediccion === 'mayor' && siguiente.valor > actual.valor) ||
      (prediccion === 'menor' && siguiente.valor < actual.valor);

    if (acerto) {
      this.aciertos.update((n) => n + 1);
      this.indice += 1;
      this.revelacionTimer = window.setTimeout(() => {
        this.revelacionTimer = null;
        this.cartaActual.set(siguiente);
        this.cartaRevelada.set(null);
        this.revelando.set(false);
        if (this.indice >= this.baraja.length - 1) {
          void this.finalizarPartida(true, 'Completaste toda la baraja.');
        }
      }, 1400);
      return;
    }

    this.vidas.update((v) => Math.max(0, v - 1));
    const vidasRestantes = this.vidas();
    this.indice += 1;

    if (vidasRestantes <= 0) {
      this.revelacionTimer = window.setTimeout(() => {
        this.revelacionTimer = null;
        this.cartaActual.set(siguiente);
        this.cartaRevelada.set(null);
        this.revelando.set(false);
        void this.finalizarPartida(false, 'Te quedaste sin vidas.');
      }, 1400);
      return;
    }

    this.revelacionTimer = window.setTimeout(() => {
      this.revelacionTimer = null;
      this.cartaActual.set(siguiente);
      this.cartaRevelada.set(null);
      this.revelando.set(false);
      if (this.indice >= this.baraja.length - 1) {
        void this.finalizarPartida(true, 'Completaste toda la baraja.');
      }
    }, 1400);
  }

  bloquearTeclado(event: KeyboardEvent): void {
    event.preventDefault();
  }

  private async finalizarPartida(victoria: boolean, mensaje: string): Promise<void> {
    this.partidaTerminada.set(true);
    this.gano.set(victoria);
    this.mensajeFin.set(mensaje);
    await this.persistirPartida(victoria);
  }

  private async persistirPartida(victoria: boolean): Promise<void> {
    if (this.partidaPersistida) {
      return;
    }
    this.partidaPersistida = true;
    this.guardando.set(true);

    const tiempoSegundos = Math.max(1, Math.round((Date.now() - this.inicioMs) / 1000));
    const { error } = await this.partidas.guardarPartida({
      cartas_acertadas: this.aciertos(),
      cartas_jugadas: this.intentos(),
      tiempo_segundos: tiempoSegundos,
      gano: victoria,
    });

    this.guardando.set(false);
    if (error) {
      this.modalTitle.set('No se guardó la partida');
      this.modalBody.set(error);
      this.modalOpen.set(true);
      return;
    }
    this.partidaGuardada.set(true);
  }

  cerrarModal(): void {
    this.modalOpen.set(false);
  }
}
