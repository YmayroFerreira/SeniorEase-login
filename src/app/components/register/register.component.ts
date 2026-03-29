import { Component, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserConfigService } from '../../services/user-config.service';
import { ButtonComponent, TextComponent } from '@senior-ease/ui';

@Component({
    selector: 'app-register',
    imports: [FormsModule, RouterLink, ButtonComponent, TextComponent],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private userConfig = inject(UserConfigService);
  private router = inject(Router);

  displayName = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  loading = false;

  async onRegister() {
    this.errorMessage = '';

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    this.loading = true;
    try {
      await this.authService.signUp(this.email, this.password);
      // Set displayName on the Firebase Auth profile
      await this.authService.updateUserProfile({ displayName: this.displayName });
      // Seed user config in Firestore with their chosen display name
      await this.userConfig.saveConfig({
        displayName: this.displayName,
        theme: 'light',
        language: 'en',
        notifications: true
      });
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.errorMessage = this.friendlyError(err.code);
    } finally {
      this.loading = false;
    }
  }

  private friendlyError(code: string): string {
    const map: Record<string, string> = {
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
    };
    return map[code] ?? 'Something went wrong. Please try again.';
  }
}
