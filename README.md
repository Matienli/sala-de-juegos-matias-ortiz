# Sala de juegos — Programación IV

**Alumno/a:** Matias Ortiz Billordo

Aplicación Angular con las pantallas del **Sprint 1**: Inicio, Login, Registro y Quién soy.

## Sprint 1

- Proyecto Angular con layout y rutas (`/`, `/login`, `/registro`, `/quien-soy`).
- Navegación libre entre pantallas (sin guards).
- **Quién soy:** perfil desde `https://api.github.com/users/:username` (configurar `githubUsername` en `environment`).
- Explicación del **juego propio** en Quién soy (`environment.ownGame`).
- Favicon propio en `public/favicon.svg`.
- Deploy en **Vercel** (`vercel.json`).

## Desarrollo local

```bash
npm install
npm start
```

Abrí http://localhost:4200/

## Deploy (Vercel)

- Build: `npm run build`
- Output: `dist/sala-de-juegos/browser`

Conectá el repositorio en [Vercel](https://vercel.com) y usá la configuración de `vercel.json`.
