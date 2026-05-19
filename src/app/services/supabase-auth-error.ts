import type { AuthError } from '@supabase/supabase-js';

export function mapSupabaseAuthError(error: AuthError | null | undefined): string {
  if (!error) {
    return 'Ocurrió un error al autenticar. Intentá de nuevo.';
  }
  const code = error.code ?? '';
  const msg = (error.message ?? '').toLowerCase();

  if (code === 'invalid_credentials' || msg.includes('invalid login')) {
    return 'Correo o contraseña incorrectos.';
  }
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return 'Tenés que confirmar el correo antes de ingresar. Revisá tu bandeja de entrada.';
  }
  if (
    code === 'user_already_registered' ||
    code === 'email_exists' ||
    msg.includes('already registered') ||
    msg.includes('user already') ||
    msg.includes('already been registered')
  ) {
    return 'Ese correo ya está registrado. Iniciá sesión o usá otro mail.';
  }
  if (code === 'over_email_send_rate_limit' || msg.includes('rate limit')) {
    return 'Se enviaron demasiados correos. Esperá unos minutos o desactivá la confirmación por mail en desarrollo.';
  }
  if (code === 'weak_password' || msg.includes('password')) {
    return 'La contraseña no cumple los requisitos de seguridad.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'No se pudo conectar con el servidor. Revisá tu conexión.';
  }

  return error.message || 'No se pudo completar la operación.';
}
