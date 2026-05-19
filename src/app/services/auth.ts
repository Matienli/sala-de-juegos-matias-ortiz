import { computed, Injectable, signal } from '@angular/core';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

import { environment } from '../../environments/environment';
import { AuthUser } from '../models/auth-user.model';
import { mapSupabaseAuthError } from './supabase-auth-error';

export interface SignUpPayload {
  nombre: string;
  apellido: string;
  edad: number;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly client: SupabaseClient | null;
  private readonly userSignal = signal<AuthUser | null>(null);
  private readonly sessionReady: Promise<void>;

  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.userSignal() !== null);

  constructor() {
    const url = environment.supabaseUrl?.trim() ?? '';
    const key = environment.supabaseAnonKey?.trim() ?? '';

    if (url && key) {
      this.client = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      this.sessionReady = this.syncSessionFromSupabase();
      this.client.auth.onAuthStateChange((_event, session) => {
        this.userSignal.set(session?.user ? this.mapSupabaseUser(session.user) : null);
      });
    } else {
      this.client = null;
      this.sessionReady = Promise.resolve();
    }
  }

  whenSessionReady(): Promise<void> {
    return this.sessionReady;
  }

  async signInWithEmailPassword(email: string, password: string): Promise<{ error: string | null }> {
    if (!this.client) {
      return { error: 'Supabase no está configurado.' };
    }
    const { data, error } = await this.client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      return { error: mapSupabaseAuthError(error) };
    }
    if (data.user) {
      this.userSignal.set(this.mapSupabaseUser(data.user));
    }
    return { error: null };
  }

  async signUpWithProfile(payload: SignUpPayload): Promise<{ error: string | null; needsEmailConfirmation: boolean }> {
    if (!this.client) {
      return {
        error: 'Supabase no está configurado.',
        needsEmailConfirmation: false,
      };
    }
    const email = payload.email.trim();
    const nombre = payload.nombre.trim();
    const apellido = payload.apellido.trim();
    const edad = Math.min(120, Math.max(1, Math.floor(payload.edad)));

    const { data, error } = await this.client.auth.signUp({
      email,
      password: payload.password,
      options: {
        data: {
          nombre,
          apellido,
          edad,
        },
      },
    });
    if (error) {
      return { error: mapSupabaseAuthError(error), needsEmailConfirmation: false };
    }
    if (data.user && data.user.identities?.length === 0) {
      return {
        error: 'Ese correo ya está registrado. Iniciá sesión o usá otro mail.',
        needsEmailConfirmation: false,
      };
    }
    if (data.session && data.user) {
      this.userSignal.set(this.mapSupabaseUser(data.user));
      return { error: null, needsEmailConfirmation: false };
    }
    return { error: null, needsEmailConfirmation: true };
  }

  async logout(): Promise<void> {
    if (this.client) {
      await this.client.auth.signOut();
    }
    this.userSignal.set(null);
  }

  private async syncSessionFromSupabase(): Promise<void> {
    if (!this.client) {
      return;
    }
    const { data } = await this.client.auth.getSession();
    const u = data.session?.user;
    this.userSignal.set(u ? this.mapSupabaseUser(u) : null);
  }

  private mapSupabaseUser(user: User): AuthUser {
    const email = user.email ?? '';
    const meta = user.user_metadata as
      | { nombre?: string; apellido?: string; display_name?: string }
      | undefined;
    const n = typeof meta?.nombre === 'string' ? meta.nombre.trim() : '';
    const a = typeof meta?.apellido === 'string' ? meta.apellido.trim() : '';
    const joined = [n, a].filter(Boolean).join(' ').trim();
    const legacy = typeof meta?.display_name === 'string' ? meta.display_name.trim() : '';
    const username = joined || legacy || this.usernameFromEmail(email);
    return { username, email };
  }

  private usernameFromEmail(email: string): string {
    const trimmed = email.trim();
    const at = trimmed.indexOf('@');
    return at > 0 ? trimmed.slice(0, at) : trimmed;
  }
}
