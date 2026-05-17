import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  MessageModal,
  type MessageModalVariant,
} from '../../components/message-modal/message-modal';

const passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (password === undefined || confirm === undefined) {
    return null;
  }
  return password === confirm ? null : { passwordsMismatch: true };
};

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, MessageModal],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group(
    {
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator },
  );

  readonly modalOpen = signal(false);
  readonly modalTitle = signal('');
  readonly modalBody = signal('');
  readonly modalVariant = signal<MessageModalVariant>('danger');

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.openModal(
        'Revisá el formulario',
        'Completá todos los campos y asegurate de que las contraseñas coincidan.',
        'danger',
      );
      return;
    }
    this.openModal('Registro', 'Estamos por el primer sprint.', 'info');
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
