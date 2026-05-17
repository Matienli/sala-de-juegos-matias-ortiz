import { Component, input, output } from '@angular/core';

export type MessageModalVariant = 'danger' | 'info';

@Component({
  selector: 'app-message-modal',
  templateUrl: './message-modal.html',
  styleUrl: './message-modal.css',
})
export class MessageModal {
  readonly open = input(false);
  readonly title = input('Aviso');
  readonly body = input('');
  readonly variant = input<MessageModalVariant>('danger');

  readonly closed = output<void>();

  close(): void {
    this.closed.emit();
  }
}
