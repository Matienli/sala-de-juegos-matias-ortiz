import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MessageModal } from '../../../components/message-modal/message-modal';
import type { Encuesta, RecomendacionEncuesta } from '../../../models/encuesta.model';
import { AuthService } from '../../../services/auth';
import { EncuestasService } from '../../../services/encuestas.service';

const ETIQUETA_JUEGO: Record<string, string> = {
  ahorcado: 'Ahorcado',
  'mayor-o-menor': 'Mayor o menor',
  preguntados: 'Preguntados',
  'click-rapido': 'Click rápido',
};

const ETIQUETA_COSAS: Record<string, string> = {
  variedad: 'Variedad de juegos',
  diseño: 'Diseño y colores',
  chat: 'Chat en sala',
  resultados: 'Tablero de resultados',
  desafio: 'Nivel de desafío',
};

const ETIQUETA_RECOMENDACION: Record<RecomendacionEncuesta, string> = {
  definitivo: 'Sí',
  'tal-vez': 'Tal vez',
  no: 'No',
};

@Component({
  selector: 'app-encuestas-listado',
  imports: [RouterLink, DatePipe, MessageModal],
  templateUrl: './encuestas-listado.html',
  styleUrl: './encuestas-listado.css',
})
export class EncuestasListado implements OnInit {
  private readonly encuestas = inject(EncuestasService);
  readonly auth = inject(AuthService);

  readonly cargando = signal(true);
  readonly lista = signal<Encuesta[]>([]);

  readonly modalOpen = signal(false);
  readonly modalTitle = signal('');
  readonly modalBody = signal('');

  ngOnInit(): void {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    const { data, error } = await this.encuestas.listarEncuestas();
    this.cargando.set(false);
    if (error) {
      this.modalTitle.set('Encuestas');
      this.modalBody.set(error);
      this.modalOpen.set(true);
      return;
    }
    this.lista.set(data);
  }

  etiquetaJuego(valor: string): string {
    return ETIQUETA_JUEGO[valor] ?? valor;
  }

  etiquetaCosa(valor: string): string {
    return ETIQUETA_COSAS[valor] ?? valor;
  }

  etiquetaRecomendacion(valor: string): string {
    return ETIQUETA_RECOMENDACION[valor as RecomendacionEncuesta] ?? valor;
  }

  cerrarModal(): void {
    this.modalOpen.set(false);
  }
}
