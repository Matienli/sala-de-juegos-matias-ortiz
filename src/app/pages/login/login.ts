import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  MessageModal,
  type MessageModalVariant,
} from '../../components/message-modal/message-modal';
import { environment } from '../../../environments/environment';
import type { QuickLoginAccount } from '../../../environments/environment.types';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, MessageModal],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly submitting = signal(false);
  readonly modalOpen = signal(false);
  readonly modalTitle = signal('');
  readonly modalBody = signal('');
  readonly modalVariant = signal<MessageModalVariant>('danger');

  readonly quickLogins: readonly QuickLoginAccount[] = (environment.quickLoginUsers ?? []).slice(
    0,
    3,
  );
  readonly showQuickLogin = this.quickLogins.length === 3;

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.openModal(
        'Formulario incompleto',
        'Revisá el correo y la contraseña.',
      );
      return;
    }
    const { email, password } = this.form.getRawValue();
    await this.ingresar(email, password);
  }

  async quickLogin(account: QuickLoginAccount): Promise<void> {
    this.form.patchValue({ email: account.email, password: account.password });
    await this.ingresar(account.email, account.password);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  private async ingresar(email: string, password: string): Promise<void> {
    this.submitting.set(true);
    const { error } = await this.auth.signInWithEmailPassword(email, password);
    this.submitting.set(false);

    if (error) {
      this.openModal('No se pudo ingresar', error);
      return;
    }

    await this.irDespuesDeLogin();
  }

  private async irDespuesDeLogin(): Promise<void> {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const puedeVolver =
      !!returnUrl &&
      returnUrl.startsWith('/') &&
      !returnUrl.startsWith('/login') &&
      !returnUrl.startsWith('/registro');
    const destino = puedeVolver ? returnUrl : '/';
    await this.router.navigateByUrl(destino, { replaceUrl: true });
  }

  private openModal(title: string, body: string, variant: MessageModalVariant = 'danger'): void {
    this.modalTitle.set(title);
    this.modalBody.set(body);
    this.modalVariant.set(variant);
    this.modalOpen.set(true);
  }
}
