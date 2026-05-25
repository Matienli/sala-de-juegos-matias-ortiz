import { inject, Injectable } from '@angular/core';

import type { PartidaClickRapidoInsert } from '../models/partida-click-rapido.model';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class ClickRapidoPartidasService {
  private readonly auth = inject(AuthService);

  async guardarPartida(
    payload: Omit<PartidaClickRapidoInsert, 'user_id' | 'nombre_usuario'>,
  ): Promise<{ error: string | null }> {
    const client = this.auth.getSupabaseClient();
    const user = this.auth.user();
    if (!client || !user) {
      return { error: 'Tenés que iniciar sesión para guardar la partida.' };
    }

    const { error } = await client.from('partidas_click_rapido').insert({
      user_id: user.id,
      nombre_usuario: user.username,
      ...payload,
    });

    if (error) {
      return { error: 'No se pudo guardar la partida. Ejecutá supabase/partidas_click_rapido.sql en Supabase.' };
    }
    return { error: null };
  }
}
