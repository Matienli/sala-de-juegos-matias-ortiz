export interface MensajeChat {
  id: string;
  user_id: string;
  nombre_usuario: string;
  mensaje: string;
  enviado_en: string;
}

export function mapMensajeChat(row: Record<string, unknown>): MensajeChat {
  return {
    id: String(row['id'] ?? ''),
    user_id: String(row['user_id'] ?? ''),
    nombre_usuario: String(row['nombre_usuario'] ?? 'Usuario'),
    mensaje: String(row['mensaje'] ?? ''),
    enviado_en: String(row['enviado_en'] ?? new Date().toISOString()),
  };
}
