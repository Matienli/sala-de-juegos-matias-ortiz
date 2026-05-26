import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  MessageModal,
  type MessageModalVariant,
} from '../../components/message-modal/message-modal';
import type { RecomendacionEncuesta } from '../../models/encuesta.model';
import { AuthService } from '../../services/auth';
import { EncuestasService } from '../../services/encuestas.service';
import { telefonoValidators, TELEFONO_AYUDA_MSG } from '../../validators/telefono.validator';

interface OpcionCheckbox {
  valor: string;
  etiqueta: string;
}

const JUEGOS_OPCIONES = [
  { valor: 'ahorcado', etiqueta: 'Ahorcado' },
  { valor: 'mayor-o-menor', etiqueta: 'Mayor o menor' },
  { valor: 'preguntados', etiqueta: 'Preguntados' },
  { valor: 'click-rapido', etiqueta: 'Click rápido' },
] as const;

const COSAS_OPCIONES: OpcionCheckbox[] = [
  { valor: 'variedad', etiqueta: 'Variedad de juegos' },
  { valor: 'diseño', etiqueta: 'Diseño y colores' },
  { valor: 'chat', etiqueta: 'Chat en sala' },
  { valor: 'resultados', etiqueta: 'Tablero de resultados' },
  { valor: 'desafio', etiqueta: 'Nivel de desafío' },
];

const RECOMENDACION_OPCIONES: { valor: RecomendacionEncuesta; etiqueta: string }[] = [
  { valor: 'definitivo', etiqueta: 'Sí' },
  { valor: 'tal-vez', etiqueta: 'Tal vez' },
  { valor: 'no', etiqueta: 'No' },
];

@Component({
  selector: 'app-encuesta',
  imports: [ReactiveFormsModule, RouterLink, MessageModal],
  templateUrl: './encuesta.html',
  styleUrl: './encuesta.css',
})
export class Encuesta {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly encuestas = inject(EncuestasService);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  readonly juegosOpciones = JUEGOS_OPCIONES;
  readonly cosasOpciones = COSAS_OPCIONES;
  readonly recomendacionOpciones = RECOMENDACION_OPCIONES;
  readonly telefonoAyuda = TELEFONO_AYUDA_MSG;

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    edad: new FormControl<number | null>(null, {
      nonNullable: false,
      validators: [Validators.required, Validators.min(18), Validators.max(99)],
    }),
    telefono: ['', telefonoValidators],
    juegoFavorito: ['', Validators.required],
    cosasQueGustaron: this.fb.array<FormControl<boolean>>(
      COSAS_OPCIONES.map(() => this.fb.control(false)),
      almenosUnoSeleccionado,
    ),
    recomendacion: ['', Validators.required],
    comentario: ['', [Validators.required, Validators.minLength(5)]],
  });

  readonly enviando = signal(false);
  readonly modalOpen = signal(false);
  readonly modalTitle = signal('');
  readonly modalBody = signal('');
  readonly modalVariant = signal<MessageModalVariant>('danger');

  get cosasArray(): FormArray<FormControl<boolean>> {
    return this.form.controls.cosasQueGustaron;
  }

  readonly cosasInvalida = computed(() => false);

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.openModal(
        'Revisá el formulario',
        'Hay campos sin completar o con errores. Todos los campos son requeridos.',
        'danger',
      );
      return;
    }

    const raw = this.form.getRawValue();
    const edad = raw.edad;
    if (edad === null) {
      return;
    }

    const cosasSeleccionadas = COSAS_OPCIONES
      .filter((_, i) => raw.cosasQueGustaron[i])
      .map((o) => o.valor);

    this.enviando.set(true);
    const { error } = await this.encuestas.guardarEncuesta({
      nombre: raw.nombre.trim(),
      apellido: raw.apellido.trim(),
      edad,
      telefono: raw.telefono.trim(),
      juego_favorito: raw.juegoFavorito,
      cosas_que_gustaron: cosasSeleccionadas,
      recomendacion: raw.recomendacion as RecomendacionEncuesta,
      comentario: raw.comentario.trim(),
    });
    this.enviando.set(false);

    if (error) {
      this.openModal('No se pudo enviar', error, 'danger');
      return;
    }

    this.openModal(
      '¡Gracias por tu encuesta!',
      'Guardamos tus respuestas. Te llevamos al inicio.',
      'info',
    );
    setTimeout(() => {
      void this.router.navigateByUrl('/', { replaceUrl: true });
    }, 1500);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  private openModal(title: string, body: string, variant: MessageModalVariant): void {
    this.modalTitle.set(title);
    this.modalBody.set(body);
    this.modalVariant.set(variant);
    this.modalOpen.set(true);
  }
}

function almenosUnoSeleccionado(control: AbstractControl): ValidationErrors | null {
  const arr = control as FormArray<FormControl<boolean>>;
  const alguno = arr.controls.some((c) => c.value === true);
  return alguno ? null : { almenosUno: true };
}
