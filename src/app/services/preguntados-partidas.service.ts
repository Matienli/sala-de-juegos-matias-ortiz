import { inject, Injectable } from '@angular/core';

import type { PartidaPreguntadosInsert } from '../models/partida-preguntados.model';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class PreguntadosPartidasService {
  private readonly auth = inject(AuthService);

  async guardarPartida(
    payload: Omit<PartidaPreguntadosInsert, 'user_id' | 'nombre_usuario'>,
  ): Promise<{ error: string | null }> {
    const client = this.auth.getSupabaseClient();
    const user = this.auth.user();
    if (!client || !user) {
      return { error: 'Tenés que iniciar sesión para guardar la partida.' };
    }

    const { error } = await client.from('partidas_preguntados').insert({
      user_id: user.id,
      nombre_usuario: user.username,
      ...payload,
    });

    if (error) {
      return { error: 'No se pudo guardar la partida. Ejecutá supabase/partidas_preguntados.sql en Supabase.' };
    }
    return { error: null };
  }
}
