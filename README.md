# Sala de juegos — Programación IV

**Alumno:** Matias Ortiz Billordo

**Repositorio:** [github.com/Matienli/sala-de-juegos-matias-ortiz](https://github.com/Matienli/sala-de-juegos-matias-ortiz)

Aplicación Angular con las pantallas del **Sprint 1**: Inicio, Login, Registro y Quién soy.

## Vercel

**URL:** https://vercel.com/matias-projects23/sala-de-juegos-matias-ortiz/DJGbASy61HjMfitRDgHBbZiuLpjE

## Sprint 1

- Proyecto Angular con layout y rutas (`/`, `/login`, `/registro`, `/quien-soy`).
- Navegación libre entre pantallas.
- **Quién soy:** perfil desde `https://api.github.com/users/:username`.
- **Juego propio:** Click rápido (descripción en `environment.ownGame`).
- Mensajes(login, registro, error de GitHub).
- Favicon propio en `public/favicon.svg` y `public/favicon.ico`.
- UI con **Bootstrap 5** (CDN).

## Desarrollo local

```bash
npm install
npm start
```

Abrí http://localhost:4200/

## Deploy (Vercel)

El proyecto incluye `vercel.json` con:

| Opción | Valor |
|--------|--------|
| Build | `npm run build` |
| Output | `dist/sala-de-juegos/browser` |
| Rutas SPA | rewrite a `index.html` |
