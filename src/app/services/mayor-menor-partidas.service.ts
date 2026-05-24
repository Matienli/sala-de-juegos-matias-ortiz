import { inject, Injectable } from '@angular/core';

import type { PartidaMayorMenorInsert } from '../models/partida-mayor-menor.model';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class MayorMenorPartidasService {
  private readonly auth = inject(AuthService);

  async guardarPartida(
    payload: Omit<PartidaMayorMenorInsert, 'user_id' | 'nombre_usuario'>,
  ): Promise<{ error: string | null }> {
    const client = this.auth.getSupabaseClient();
    const user = this.auth.user();
    if (!client || !user) {
      return { error: 'Tenés que iniciar sesión para guardar la partida.' };
    }

    const { error } = await client.from('partidas_mayor_menor').insert({
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
