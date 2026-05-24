import { Injectable, inject, signal } from '@angular/core';
import type { RealtimeChannel } from '@supabase/supabase-js';

import { mapMensajeChat, type MensajeChat } from '../models/mensaje-chat.model';
import { AuthService } from './auth';

const TABLA = 'mensajes_chat';
const LIMITE_HISTORIAL = 150;

@Injectable({
  providedIn: 'root',
})
export class ChatSalaService {
  private readonly auth = inject(AuthService);
  private canal: RealtimeChannel | null = null;

  readonly mensajes = signal<MensajeChat[]>([]);
  readonly cargando = signal(false);
  readonly enviando = signal(false);

  async iniciar(): Promise<{ error: string | null }> {
    const historial = await this.cargarHistorial();
    if (historial.error) {
      return historial;
    }
    this.suscribirRealtime();
    return { error: null };
  }

  detener(): void {
    const client = this.auth.getSupabaseClient();
    if (this.canal && client) {
      void client.removeChannel(this.canal);
      this.canal = null;
    }
  }

  async enviarMensaje(texto: string): Promise<{ error: string | null }> {
    const client = this.auth.getSupabaseClient();
    const user = this.auth.user();
    if (!client || !user) {
      return { error: 'Tenés que iniciar sesión para enviar mensajes.' };
    }

    const mensaje = texto.trim();
    if (!mensaje) {
      return { error: 'Escribí un mensaje antes de enviar.' };
    }
    if (mensaje.length > 500) {
      return { error: 'El mensaje no puede superar los 500 caracteres.' };
    }

    this.enviando.set(true);
    const { error } = await client.from(TABLA).insert({
      user_id: user.id,
      nombre_usuario: user.username,
      mensaje,
    });
    this.enviando.set(false);

    if (error) {
      return { error: 'No se pudo enviar el mensaje. Revisá la tabla y los permisos en Supabase.' };
    }
    return { error: null };
  }

  private async cargarHistorial(): Promise<{ error: string | null }> {
    const client = this.auth.getSupabaseClient();
    const user = this.auth.user();
    if (!client || !user) {
      return { error: 'Tenés que iniciar sesión para ver el chat.' };
    }

    this.cargando.set(true);
    const { data, error } = await client
      .from(TABLA)
      .select('id, user_id, nombre_usuario, mensaje, enviado_en')
      .order('enviado_en', { ascending: true })
      .limit(LIMITE_HISTORIAL);

    this.cargando.set(false);

    if (error) {
      return { error: 'No se pudieron cargar los mensajes. Ejecutá supabase/mensajes_chat.sql en tu proyecto.' };
    }

    this.mensajes.set((data ?? []).map((row) => mapMensajeChat(row as Record<string, unknown>)));
    return { error: null };
  }

  private suscribirRealtime(): void {
    const client = this.auth.getSupabaseClient();
    if (!client || this.canal) {
      return;
    }

    this.canal = client
      .channel('chat-sala-global')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: TABLA },
        (payload) => {
          this.agregarMensaje(mapMensajeChat(payload.new as Record<string, unknown>));
        },
      )
      .subscribe();
  }

  private agregarMensaje(mensaje: MensajeChat): void {
    this.mensajes.update((lista) => {
      if (lista.some((m) => m.id === mensaje.id)) {
        return lista;
      }
      const siguiente = [...lista, mensaje];
      if (siguiente.length > LIMITE_HISTORIAL) {
        return siguiente.slice(-LIMITE_HISTORIAL);
      }
      return siguiente;
    });
  }
}
