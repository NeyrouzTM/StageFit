import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;
  error?: string;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.value as { email: string; password: string };
    this.loading = true;
    this.error = undefined;
    this.auth.login(email, password).subscribe({
      next: () => {
        const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/stages';
        this.router.navigateByUrl(redirect);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Connexion impossible';
        this.loading = false;
      }
    });
  }
}
