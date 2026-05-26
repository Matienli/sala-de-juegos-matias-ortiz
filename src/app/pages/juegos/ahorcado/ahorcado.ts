import { NgClass } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MessageModal } from '../../../components/message-modal/message-modal';
import { AHORCADO_PALABRAS } from '../../../data/ahorcado-palabras';
import { AhorcadoPartidasService } from '../../../services/ahorcado-partidas.service';
import { AuthService } from '../../../services/auth';

const ALFABETO = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
const MAX_ERRORES = 6;

function esLetraAdivinable(char: string): boolean {
  return char !== ' ' && char.length === 1;
}

@Component({
  selector: 'app-ahorcado',
  imports: [RouterLink, NgClass, MessageModal],
  templateUrl: './ahorcado.html',
  styleUrl: './ahorcado.css',
})
export class Ahorcado implements OnInit, OnDestroy {
  private readonly partidas = inject(AhorcadoPartidasService);
  readonly auth = inject(AuthService);

  readonly alfabeto = ALFABETO;
  readonly maxErrores = MAX_ERRORES;

  readonly palabraSecreta = signal('');
  readonly letrasUsadas = signal<ReadonlySet<string>>(new Set());
  readonly errores = signal(0);
  readonly partidaTerminada = signal(false);
  readonly gano = signal(false);
  readonly guardando = signal(false);
  readonly partidaGuardada = signal(false);
  readonly tiempoSegundos = signal(0);

  readonly modalOpen = signal(false);
  readonly modalTitle = signal('');
  readonly modalBody = signal('');

  private inicioMs = 0;
  private partidaPersistida = false;
  private tiempoTimer: ReturnType<typeof setInterval> | null = null;

  readonly tiempoFormateado = computed(() => {
    const total = this.tiempoSegundos();
    const minutos = Math.floor(total / 60);
    const segundos = total % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  });

  readonly palabraMostrada = computed(() => {
    const palabra = this.palabraSecreta();
    const usadas = this.letrasUsadas();
    return palabra
      .split('')
      .map((char) => {
        if (char === ' ') {
          return ' ';
        }
        return usadas.has(char) ? char : '_';
      })
      .join('');
  });

  readonly juegoActivo = computed(() => !this.partidaTerminada());

  readonly longitudPalabra = computed(
    () => this.palabraSecreta().replace(/\s/g, '').length,
  );

  readonly puntaje = computed(() => {
    const base = this.gano() ? 500 : 0;
    const bonusErrores = (MAX_ERRORES - this.errores()) * 50;
    const bonusPalabra = this.longitudPalabra() * 10;
    const penalizacionTiempo = this.tiempoSegundos() * 2;
    return Math.max(0, base + bonusErrores + bonusPalabra - penalizacionTiempo);
  });

  ngOnInit(): void {
    this.nuevaPartida();
  }

  ngOnDestroy(): void {
    this.detenerCronometro();
  }

  nuevaPartida(): void {
    const indice = Math.floor(Math.random() * AHORCADO_PALABRAS.length);
    this.palabraSecreta.set(AHORCADO_PALABRAS[indice]);
    this.letrasUsadas.set(new Set());
    this.errores.set(0);
    this.partidaTerminada.set(false);
    this.gano.set(false);
    this.partidaGuardada.set(false);
    this.partidaPersistida = false;
    this.inicioMs = Date.now();
    this.tiempoSegundos.set(0);
    this.iniciarCronometro();
  }

  private iniciarCronometro(): void {
    this.detenerCronometro();
    this.tiempoTimer = setInterval(() => {
      this.tiempoSegundos.set(Math.floor((Date.now() - this.inicioMs) / 1000));
    }, 1000);
  }

  private detenerCronometro(): void {
    if (this.tiempoTimer !== null) {
      clearInterval(this.tiempoTimer);
      this.tiempoTimer = null;
    }
  }

  elegirLetra(letra: string): void {
    if (!this.juegoActivo()) {
      return;
    }
    const usadas = this.letrasUsadas();
    if (usadas.has(letra)) {
      return;
    }

    const nuevas = new Set(usadas);
    nuevas.add(letra);
    this.letrasUsadas.set(nuevas);

    const palabra = this.palabraSecreta();
    if (!palabra.includes(letra)) {
      this.errores.update((n) => n + 1);
    }

    if (this.esVictoria(palabra, nuevas)) {
      this.finalizarPartida(true);
      return;
    }
    if (this.errores() >= MAX_ERRORES) {
      this.finalizarPartida(false);
    }
  }

  bloquearTeclado(event: KeyboardEvent): void {
    event.preventDefault();
  }

  estadoLetra(letra: string): 'pendiente' | 'acierto' | 'error' | 'deshabilitada' {
    const usadas = this.letrasUsadas();
    if (!usadas.has(letra)) {
      return this.juegoActivo() ? 'pendiente' : 'deshabilitada';
    }
    return this.palabraSecreta().includes(letra) ? 'acierto' : 'error';
  }

  private esVictoria(palabra: string, usadas: ReadonlySet<string>): boolean {
    return palabra
      .split('')
      .filter(esLetraAdivinable)
      .every((letra) => usadas.has(letra));
  }

  private async finalizarPartida(victoria: boolean): Promise<void> {
    this.partidaTerminada.set(true);
    this.gano.set(victoria);
    this.tiempoSegundos.set(Math.max(1, Math.round((Date.now() - this.inicioMs) / 1000)));
    this.detenerCronometro();
    await this.persistirPartida(victoria);
  }

  private async persistirPartida(victoria: boolean): Promise<void> {
    if (this.partidaPersistida) {
      return;
    }
    this.partidaPersistida = true;
    this.guardando.set(true);

    const { error } = await this.partidas.guardarPartida({
      palabra: this.palabraSecreta(),
      gano: victoria,
      tiempo_segundos: this.tiempoSegundos(),
      cantidad_letras_seleccionadas: this.letrasUsadas().size,
      intentos_fallidos: this.errores(),
      puntaje: this.puntaje(),
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
