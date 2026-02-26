import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AdminCredentials } from '../models/user.model';

interface AdminSession {
  email: string;
  loggedIn: boolean;
  loggedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'zaava_admin_session';

  private readonly adminCredentials: AdminCredentials = {
    email: 'admin@zaava.com',
    password: 'Admin@123'
  };

  private readonly adminLoggedInSubject = new BehaviorSubject<boolean>(this.restoreLoginState());
  readonly adminLoggedIn$ = this.adminLoggedInSubject.asObservable();

  loginAsAdmin(credentials: AdminCredentials): boolean {
    const isValid =
      credentials.email === this.adminCredentials.email &&
      credentials.password === this.adminCredentials.password;

    this.adminLoggedInSubject.next(isValid);

    if (isValid) {
      this.persistSession(credentials.email);
    } else {
      this.clearPersistedSession();
    }

    return isValid;
  }

  logoutAdmin(): void {
    this.adminLoggedInSubject.next(false);
    this.clearPersistedSession();
  }

  isAdminLoggedIn(): boolean {
    return this.adminLoggedInSubject.getValue();
  }

  private restoreLoginState(): boolean {
    try {
      const raw = localStorage.getItem(this.storageKey);

      if (!raw) {
        return false;
      }

      const parsed = JSON.parse(raw) as AdminSession;
      return parsed.loggedIn === true && parsed.email === this.adminCredentials.email;
    } catch {
      return false;
    }
  }

  private persistSession(email: string): void {
    try {
      const payload: AdminSession = {
        email,
        loggedIn: true,
        loggedAt: new Date().toISOString()
      };

      localStorage.setItem(this.storageKey, JSON.stringify(payload));
    } catch {
      // Ignore storage errors to keep auth flow functional.
    }
  }

  private clearPersistedSession(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Ignore storage errors to keep auth flow functional.
    }
  }
}
