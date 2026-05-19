import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth';

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.whenSessionReady();

  if (!auth.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
