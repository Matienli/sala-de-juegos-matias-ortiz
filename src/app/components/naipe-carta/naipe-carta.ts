import { NgClass } from '@angular/common';
import { Component, effect, input, signal } from '@angular/core';

import { rutaImagenNaipe } from '../../data/naipe-imagenes';
import {
  etiquetaNaipe,
  etiquetaValor,
  type Naipe,
  paloEsRojo,
  simboloPalo,
} from '../../models/naipe.model';

@Component({
  selector: 'app-naipe-carta',
  imports: [NgClass],
  templateUrl: './naipe-carta.html',
  styleUrl: './naipe-carta.css',
})
export class NaipeCarta {
  readonly naipe = input.required<Naipe>();
  readonly destacada = input(false);

  readonly etiquetaValor = etiquetaValor;
  readonly etiquetaNaipe = etiquetaNaipe;
  readonly simboloPalo = simboloPalo;
  readonly paloEsRojo = paloEsRojo;
  readonly rutaImagenNaipe = rutaImagenNaipe;

  readonly imagenFallo = signal(false);

  constructor() {
    effect(() => {
      this.naipe();
      this.imagenFallo.set(false);
    });
  }

  onErrorImagen(): void {
    this.imagenFallo.set(true);
  }
}
