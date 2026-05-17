import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { environment } from '../../../environments/environment';
import {
  MessageModal,
  type MessageModalVariant,
} from '../../components/message-modal/message-modal';
import { GitHubUser } from '../../models/github-user.model';
import { GithubProfileService } from '../../services/github-profile';

@Component({
  selector: 'app-quien-soy',
  imports: [DatePipe, MessageModal],
  templateUrl: './quien-soy.html',
  styleUrl: './quien-soy.css',
})
export class QuienSoy {
  private readonly github = inject(GithubProfileService);

  readonly ownGame = environment.ownGame;
  readonly loading = signal(true);
  readonly user = signal<GitHubUser | null>(null);

  readonly modalOpen = signal(false);
  readonly modalTitle = signal('');
  readonly modalBody = signal('');
  readonly modalVariant = signal<MessageModalVariant>('danger');

  constructor() {
    this.github.getStudentProfile().subscribe({
      next: (profile) => {
        this.user.set(profile);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.openModal(
          'GitHub',
          'No se pudo cargar el perfil de GitHub. Revisá el usuario en environment o tu conexión.',
          'danger',
        );
      },
    });
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
