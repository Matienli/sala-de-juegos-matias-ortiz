import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  MessageModal,
  type MessageModalVariant,
} from '../../components/message-modal/message-modal';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, MessageModal],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly modalOpen = signal(false);
  readonly modalTitle = signal('');
  readonly modalBody = signal('');
  readonly modalVariant = signal<MessageModalVariant>('danger');

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.openModal(
        'Formulario incompleto',
        'Revisá el correo y la contraseña (mínimo 6 caracteres).',
        'danger',
      );
      return;
    }
    this.openModal('Login', 'Estamos por el primer sprint.', 'info');
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
