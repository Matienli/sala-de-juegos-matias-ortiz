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
import { ClickRapido } from './pages/juegos/click-rapido/click-rapido';
import { Preguntados } from './pages/juegos/preguntados/preguntados';
import { ChatSala } from './pages/listados/chat-sala/chat-sala';
import { Resultados } from './pages/listados/resultados/resultados';
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
        component: Preguntados,
        canActivate: [authGuard],
      },
      {
        path: 'juegos/sorpresa',
        component: ClickRapido,
        canActivate: [authGuard],
      },
      {
        path: 'listados/resultados',
        component: Resultados,
        canActivate: [authGuard],
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
