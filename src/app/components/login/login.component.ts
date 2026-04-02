import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  errorMessage = '';
  loading = false;
  showPassword = false;

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

  goToRegister() {
    this.router.navigate(['/register']);
  }

  private async redirectToMainApp() {
    const token = await this.authService.getIdToken();
    window.location.href = `${environment.mainAppUrl}/auth/callback?token=${token}`;
  }

  private friendlyError(code: string): string {
    const map: Record<string, string> = {
      'auth/user-not-found': 'Nenhuma conta encontrada com este e-mail.',
      'auth/wrong-password': 'Senha incorreta.',
      'auth/invalid-email': 'Por favor, insira um e-mail válido.',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
      'auth/invalid-credential': 'E-mail ou senha inválidos.',
    };
    return map[code] ?? 'Algo deu errado. Tente novamente.';
  }
}
