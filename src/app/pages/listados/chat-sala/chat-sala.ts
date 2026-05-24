import { DatePipe } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MessageModal } from '../../../components/message-modal/message-modal';
import { ChatSalaService } from '../../../services/chat-sala.service';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-chat-sala',
  imports: [RouterLink, FormsModule, DatePipe, MessageModal],
  templateUrl: './chat-sala.html',
  styleUrl: './chat-sala.css',
})
export class ChatSala implements OnInit, OnDestroy, AfterViewChecked {
  private readonly chat = inject(ChatSalaService);
  readonly auth = inject(AuthService);

  private readonly listaMensajes = viewChild<ElementRef<HTMLDivElement>>('listaMensajes');
  private debeScrollAlFinal = false;

  readonly mensajes = this.chat.mensajes;
  readonly cargando = this.chat.cargando;
  readonly enviando = this.chat.enviando;

  textoMensaje = '';
  readonly modalOpen = signal(false);
  readonly modalTitle = signal('');
  readonly modalBody = signal('');

  constructor() {
    effect(() => {
      this.mensajes();
      this.debeScrollAlFinal = true;
    });
  }

  ngOnInit(): void {
    void this.iniciarChat();
  }

  ngOnDestroy(): void {
    this.chat.detener();
  }

  ngAfterViewChecked(): void {
    if (!this.debeScrollAlFinal) {
      return;
    }
    this.debeScrollAlFinal = false;
    const el = this.listaMensajes()?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  esPropio(userId: string): boolean {
    return this.auth.user()?.id === userId;
  }

  async enviar(): Promise<void> {
    if (this.enviando()) {
      return;
    }
    const texto = this.textoMensaje;
    const { error } = await this.chat.enviarMensaje(texto);
    if (error) {
      this.mostrarError(error);
      return;
    }
    this.textoMensaje = '';
    this.debeScrollAlFinal = true;
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    void this.enviar();
  }

  onEnter(event: Event): void {
    if (!(event instanceof KeyboardEvent) || event.shiftKey) {
      return;
    }
    event.preventDefault();
    void this.enviar();
  }

  cerrarModal(): void {
    this.modalOpen.set(false);
  }

  private async iniciarChat(): Promise<void> {
    const { error } = await this.chat.iniciar();
    if (error) {
      this.mostrarError(error);
      return;
    }
    this.debeScrollAlFinal = true;
  }

  private mostrarError(mensaje: string): void {
    this.modalTitle.set('Chat en sala');
    this.modalBody.set(mensaje);
    this.modalOpen.set(true);
  }
}
