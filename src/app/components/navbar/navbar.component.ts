import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, AsyncPipe, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  user$: Observable<any>;

  constructor(private auth: AuthService, private router: Router) {
    this.user$ = this.auth.user$;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
