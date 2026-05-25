import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MessageModal } from '../../../components/message-modal/message-modal';
import type { PartidaAhorcado } from '../../../models/partida-ahorcado.model';
import type { PartidaClickRapido } from '../../../models/partida-click-rapido.model';
import type { PartidaMayorMenor } from '../../../models/partida-mayor-menor.model';
import type { PartidaPreguntados } from '../../../models/partida-preguntados.model';
import { ResultadosService } from '../../../services/resultados.service';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-resultados',
  imports: [RouterLink, MessageModal],
  templateUrl: './resultados.html',
  styleUrl: './resultados.css',
})
export class Resultados implements OnInit {
  private readonly resultados = inject(ResultadosService);
  readonly auth = inject(AuthService);

  readonly cargando = signal(true);
  readonly ahorcado = signal<PartidaAhorcado[]>([]);
  readonly mayorMenor = signal<PartidaMayorMenor[]>([]);
  readonly preguntados = signal<PartidaPreguntados[]>([]);
  readonly clickRapido = signal<PartidaClickRapido[]>([]);

  readonly modalOpen = signal(false);
  readonly modalTitle = signal('');
  readonly modalBody = signal('');

  ngOnInit(): void {
    void this.recargar();
  }

  async recargar(): Promise<void> {
    this.cargando.set(true);
    const { data, error } = await this.resultados.cargarResultados();
    this.cargando.set(false);

    if (error || !data) {
      this.mostrarError(error ?? 'No hay datos.');
      return;
    }

    this.ahorcado.set(data.ahorcado);
    this.mayorMenor.set(data.mayorMenor);
    this.preguntados.set(data.preguntados);
    this.clickRapido.set(data.clickRapido);
  }

  porcentajeMayorMenor(partida: PartidaMayorMenor): number {
    if (partida.cartas_jugadas <= 0) {
      return 0;
    }
    return Math.round((partida.cartas_acertadas / partida.cartas_jugadas) * 100);
  }

  cerrarModal(): void {
    this.modalOpen.set(false);
  }

  private mostrarError(mensaje: string): void {
    this.modalTitle.set('Resultados');
    this.modalBody.set(mensaje);
    this.modalOpen.set(true);
  }
}
