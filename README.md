# Sala de juegos — Programación IV

**Alumno:** Matias Ortiz Billordo

**Repositorio:** https://github.com/Matienli/sala-de-juegos-matias-ortiz

Aplicación Angular con las pantallas del **Sprint 1** y la autenticación del **Sprint 2**.

## Vercel

**URL:** https://sala-de-juegos-matias-ortiz.vercel.app/

## Sprint 1

- Proyecto Angular con layout y rutas (`/`, `/login`, `/registro`, `/quien-soy`).
- Navegación libre entre pantallas.
- **Quién soy:** perfil desde `https://api.github.com/users/:username`.
- Explicación del **juego propio** en Quién soy (`environment.ownGame`).
- Favicon propio en `public/favicon.svg`.
- Deploy en **Vercel** (`vercel.json`).

## Sprint 2

- **Supabase Auth:** login y registro con correo y contraseña; cierre de sesión.
- **Registro:** nombre, apellido, edad, email y contraseña. Datos de perfil en tabla `perfiles` (la contraseña solo en Auth).
- **Home** según sesión: sin login muestra acceso a login/registro y Quién soy; con login, acceso a juegos y listados.
- **Guards:** `authGuard` en `/juegos/*` y `/listados/*`; `guestGuard` en `/login` y `/registro`.
- **Navbar** condicional (login/registro o usuario + salir).
- **Inicio rápido:** tres botones de prueba en login (`environment.quickLoginUsers`).
- Rutas placeholder para juegos y listados (próximas entregas).
- Configuración en `src/environments/environment.ts` (producción/Vercel) y `environment.development.ts` (local).

## Desarrollo local

```bash
npm install
npm start
```

Abrí http://localhost:4200/

Para que login y registro funcionen en local, completá `supabaseUrl` y `supabaseAnonKey` en `environment.development.ts`. Los usuarios de inicio rápido deben existir en Supabase Auth.

## Deploy (Vercel)

El proyecto incluye `vercel.json` con:

| Opción | Valor |
|--------|--------|
| Build | `npm run build` |
| Output | `dist/sala-de-juegos/browser` |
| Rutas SPA | rewrite a `index.html` |

