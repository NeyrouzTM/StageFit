import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../model/user';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  form: FormGroup;
  error?: string;
  success?: string;
  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      role: ['candidat', Validators.required]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, role } = this.form.value as { email: string; password: string; role: UserRole };
    this.loading = true;
    this.error = undefined;
    this.success = undefined;

    this.auth.signup({ email, password, role }).subscribe({
      next: () => {
        this.success = 'Compte créé. Vous pouvez vous connecter.';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 800);
      },
      error: (err) => {
        this.error = err?.message || 'Impossible de créer le compte';
        this.loading = false;
      }
    });
  }
}
