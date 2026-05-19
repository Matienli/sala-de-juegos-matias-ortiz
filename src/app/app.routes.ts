import { Routes } from '@angular/router';

import { Layout } from './components/layout/layout';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { QuienSoy } from './pages/quien-soy/quien-soy';
import { SitioPlaceholder } from './pages/sitio-placeholder/sitio-placeholder';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', component: Home },
      { path: 'login', component: Login, canActivate: [guestGuard] },
      { path: 'registro', component: Registro, canActivate: [guestGuard] },
      { path: 'quien-soy', component: QuienSoy },
      {
        path: 'juegos/ahorcado',
        component: SitioPlaceholder,
        canActivate: [authGuard],
        data: { title: 'Ahorcado' },
      },
      {
        path: 'juegos/mayor-o-menor',
        component: SitioPlaceholder,
        canActivate: [authGuard],
        data: { title: 'Mayor o menor' },
      },
      {
        path: 'juegos/preguntados',
        component: SitioPlaceholder,
        canActivate: [authGuard],
        data: { title: 'Preguntados' },
      },
      {
        path: 'juegos/sorpresa',
        component: SitioPlaceholder,
        canActivate: [authGuard],
        data: { title: 'Click rápido' },
      },
      {
        path: 'listados/resultados',
        component: SitioPlaceholder,
        canActivate: [authGuard],
        data: { title: 'Tablero de resultados' },
      },
      {
        path: 'listados/chat-sala',
        component: SitioPlaceholder,
        canActivate: [authGuard],
        data: { title: 'Chat en sala' },
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
