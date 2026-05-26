import { inject, Injectable } from '@angular/core';

import type { Encuesta, EncuestaInsert } from '../models/encuesta.model';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class EncuestasService {
  private readonly auth = inject(AuthService);

  async guardarEncuesta(
    payload: Omit<EncuestaInsert, 'user_id' | 'nombre_usuario'>,
  ): Promise<{ error: string | null }> {
    const client = this.auth.getSupabaseClient();
    const user = this.auth.user();
    if (!client || !user) {
      return { error: 'Tenés que iniciar sesión para enviar la encuesta.' };
    }

    const { error } = await client.from('encuestas').insert({
      user_id: user.id,
      nombre_usuario: user.username,
      ...payload,
    });

    if (error) {
      return {
        error: 'No se pudo guardar la encuesta. Ejecutá supabase/encuestas.sql en Supabase.',
      };
    }
    return { error: null };
  }

  async listarEncuestas(): Promise<{ data: Encuesta[]; error: string | null }> {
    const client = this.auth.getSupabaseClient();
    if (!client) {
      return { data: [], error: 'Supabase no está configurado.' };
    }
    const { data, error } = await client
      .from('encuestas')
      .select('*')
      .order('enviado_en', { ascending: false });

    if (error) {
      return { data: [], error: 'No se pudieron cargar las encuestas.' };
    }
    return { data: (data ?? []) as Encuesta[], error: null };
  }
}
