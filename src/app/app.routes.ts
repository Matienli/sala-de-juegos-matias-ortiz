import { Routes } from '@angular/router';

import { Layout } from './components/layout/layout';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', component: Home },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((m) => m.Login),
        canActivate: [guestGuard],
      },
      {
        path: 'registro',
        loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro),
        canActivate: [guestGuard],
      },
      {
        path: 'quien-soy',
        loadComponent: () => import('./pages/quien-soy/quien-soy').then((m) => m.QuienSoy),
      },
      {
        path: 'juegos/ahorcado',
        loadComponent: () =>
          import('./pages/juegos/ahorcado/ahorcado').then((m) => m.Ahorcado),
        canActivate: [authGuard],
      },
      {
        path: 'juegos/mayor-o-menor',
        loadComponent: () =>
          import('./pages/juegos/mayor-o-menor/mayor-o-menor').then((m) => m.MayorOMenor),
        canActivate: [authGuard],
      },
      {
        path: 'juegos/preguntados',
        loadComponent: () =>
          import('./pages/juegos/preguntados/preguntados').then((m) => m.Preguntados),
        canActivate: [authGuard],
      },
      {
        path: 'juegos/sorpresa',
        loadComponent: () =>
          import('./pages/juegos/click-rapido/click-rapido').then((m) => m.ClickRapido),
        canActivate: [authGuard],
      },
      {
        path: 'listados/resultados',
        loadComponent: () =>
          import('./pages/listados/resultados/resultados').then((m) => m.Resultados),
        canActivate: [authGuard],
      },
      {
        path: 'listados/chat-sala',
        loadComponent: () =>
          import('./pages/listados/chat-sala/chat-sala').then((m) => m.ChatSala),
        canActivate: [authGuard],
      },
      {
        path: 'encuesta',
        loadComponent: () => import('./pages/encuesta/encuesta').then((m) => m.Encuesta),
        canActivate: [authGuard],
      },
      {
        path: 'listados/encuestas',
        loadComponent: () =>
          import('./pages/listados/encuestas-listado/encuestas-listado').then(
            (m) => m.EncuestasListado,
          ),
        canActivate: [adminGuard],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
