import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const recruiterGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isRecruiter()) {
    return true;
  }
  return router.createUrlTree(['/login'], {
    queryParams: { redirect: state.url }
  });
};
