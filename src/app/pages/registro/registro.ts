import { Component, inject, signal } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  MessageModal,
  type MessageModalVariant,
} from '../../components/message-modal/message-modal';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, MessageModal],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    edad: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1), Validators.max(120)],
    }),
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly submitting = signal(false);
  readonly modalOpen = signal(false);
  readonly modalTitle = signal('');
  readonly modalBody = signal('');
  readonly modalVariant = signal<MessageModalVariant>('danger');

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.openModal(
        'Revisá el formulario',
        'Completá correo, nombre, apellido, edad (1–120) y contraseña (mínimo 6 caracteres).',
      );
      return;
    }
    const raw = this.form.getRawValue();
    const rawEdad = raw.edad;
    if (rawEdad === null || rawEdad === undefined) {
      this.openModal('Edad inválida', 'Ingresá una edad válida.');
      return;
    }
    const edad = typeof rawEdad === 'number' ? rawEdad : Number(rawEdad);
    if (Number.isNaN(edad) || !Number.isFinite(edad)) {
      this.openModal('Edad inválida', 'Ingresá una edad válida.');
      return;
    }

    this.submitting.set(true);
    const { error, needsEmailConfirmation } = await this.auth.signUpWithProfile({
      nombre: raw.nombre,
      apellido: raw.apellido,
      edad,
      email: raw.email,
      password: raw.password,
    });
    this.submitting.set(false);

    if (error) {
      const yaRegistrado = error.toLowerCase().includes('ya está registrado');
      this.openModal(
        yaRegistrado ? 'Usuario ya registrado' : 'No se pudo registrar',
        error,
      );
      return;
    }

    if (needsEmailConfirmation) {
      this.openModal(
        'Confirmá tu correo',
        'Te enviamos un enlace de confirmación. Abrilo para activar la cuenta; después podés iniciar sesión.',
        'info',
      );
      return;
    }

    await this.router.navigate(['/'], { replaceUrl: true });
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  private openModal(title: string, body: string, variant: MessageModalVariant = 'danger'): void {
    this.modalTitle.set(title);
    this.modalBody.set(body);
    this.modalVariant.set(variant);
    this.modalOpen.set(true);
  }
}
