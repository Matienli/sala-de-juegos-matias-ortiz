import { inject, Injectable } from '@angular/core';

import type { PartidaAhorcadoInsert } from '../models/partida-ahorcado.model';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class AhorcadoPartidasService {
  private readonly auth = inject(AuthService);

  async guardarPartida(payload: Omit<PartidaAhorcadoInsert, 'user_id' | 'nombre_usuario'>): Promise<{ error: string | null }> {
    const client = this.auth.getSupabaseClient();
    const user = this.auth.user();
    if (!client || !user) {
      return { error: 'Tenés que iniciar sesión para guardar la partida.' };
    }

    const { error } = await client.from('partidas_ahorcado').insert({
      user_id: user.id,
      nombre_usuario: user.username,
      ...payload,
    });

    if (error) {
      return { error: 'No se pudo guardar la partida. Revisá que exista la tabla en Supabase.' };
    }
    return { error: null };
  }
}
