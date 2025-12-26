import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { SignupComponent } from '../signup/signup.component';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, LoginComponent, SignupComponent],
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.css']
})
export class AuthPageComponent {
  mode: 'login' | 'signup' = 'login';
  switchTo(newMode: 'login' | 'signup'): void {
    this.mode = newMode;
  }
}
