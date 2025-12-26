import { Injectable } from '@angular/core';
import { BehaviorSubject, map, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserRole, User } from '../model/user';

export interface AuthUser {
  email: string;
  role: UserRole;
  token: string;
}

const STORAGE_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3001/users';
  private userSubject = new BehaviorSubject<AuthUser | null>(this.loadFromStorage());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  get user(): AuthUser | null {
    return this.userSubject.getValue();
  }

  signup(user: User) {
    return this.http.get<User[]>(`${this.apiUrl}?email=${encodeURIComponent(user.email)}`).pipe(
      switchMap((existing) => {
        if (existing.length > 0) {
          return throwError(() => new Error('Email déjà utilisé'));
        }
        return this.http.post<User>(this.apiUrl, user);
      })
    );
  }

  login(email: string, password: string) {
    return this.http
      .get<User[]>(`${this.apiUrl}?email=${encodeURIComponent(email)}`)
      .pipe(
        map((users) => {
          const user = users.find((u) => u.password === password);
          if (!user) {
            throw new Error('Email ou mot de passe invalide');
          }
          const authUser: AuthUser = {
            email: user.email,
            role: user.role,
            token: 'mock-token'
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
          this.userSubject.next(authUser);
          return authUser;
        })
      );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.userSubject.next(null);
  }

  isRecruiter(): boolean {
    return this.user?.role === 'recruteur';
  }

  isAuthenticated(): boolean {
    return !!this.user;
  }

  private loadFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch (e) {
      console.error('Auth storage parse error', e);
      return null;
    }
  }
}
