import { Routes } from '@angular/router';
import { StagesComponent } from './components/stages/stages.component';
import { AddStageComponent } from './components/add-stage/add-stage.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { StageAdvisorComponent } from './components/stage-advisor/stage-advisor.component';
import { ApplyStageComponent } from './components/apply-stage/apply-stage.component';
import { LoginComponent } from './components/login/login.component';
import { recruiterGuard } from './guards/auth.guard';
import { SignupComponent } from './components/signup/signup.component';
import { AuthPageComponent } from './components/auth-page/auth-page.component';

export const routes: Routes = [
  { path: 'stages', component: StagesComponent },
  { path: 'add-stage', component: AddStageComponent, canActivate: [recruiterGuard] },
  { path: 'advisor', component: StageAdvisorComponent },
  { path: 'apply/:ref', component: ApplyStageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'auth', component: AuthPageComponent },
  { path: '', redirectTo: 'stages', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }
];
