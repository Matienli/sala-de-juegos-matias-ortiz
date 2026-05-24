import { Routes } from '@angular/router';

import { Layout } from './components/layout/layout';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { QuienSoy } from './pages/quien-soy/quien-soy';
import { Ahorcado } from './pages/juegos/ahorcado/ahorcado';
import { MayorOMenor } from './pages/juegos/mayor-o-menor/mayor-o-menor';
import { ChatSala } from './pages/listados/chat-sala/chat-sala';
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
        component: Ahorcado,
        canActivate: [authGuard],
      },
      {
        path: 'juegos/mayor-o-menor',
        component: MayorOMenor,
        canActivate: [authGuard],
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
        component: ChatSala,
        canActivate: [authGuard],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
