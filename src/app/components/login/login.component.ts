import { Component, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent, DividerComponent, TextComponent } from '@senior-ease/ui';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-login',
    imports: [FormsModule, ButtonComponent, DividerComponent, TextComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);

  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  async onLogin() {
    this.loading = true;
    this.errorMessage = '';
    try {
      await this.authService.signIn(this.email, this.password);
      await this.redirectToMainApp();
    } catch (err: any) {
      this.errorMessage = this.friendlyError(err.code);
      this.loading = false;
    }
  }

  async onGoogleLogin() {
    this.loading = true;
    this.errorMessage = '';
    try {
      await this.authService.signInWithGoogle();
      await this.redirectToMainApp();
    } catch (err: any) {
      this.errorMessage = this.friendlyError(err.code);
      this.loading = false;
    }
  }

  private async redirectToMainApp() {
    const token = await this.authService.getIdToken();
    window.location.href = `${environment.mainAppUrl}/auth/callback?token=${token}`;
  }

  private friendlyError(code: string): string {
    const map: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/invalid-credential': 'Invalid email or password.',
    };
    return map[code] ?? 'Something went wrong. Please try again.';
  }
}
