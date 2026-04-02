import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  loading = false;
  submitted = false;
  showPassword = false;
  showConfirmPassword = false;

  // ── Per-field validation getters ──────────────────────────

  get nameError(): string {
    if (!this.submitted) return '';
    if (!this.name.trim()) return 'Nome é obrigatório.';
    if (this.name.trim().length < 2) return 'Nome deve ter ao menos 2 caracteres.';
    return '';
  }

  get emailError(): string {
    if (!this.submitted) return '';
    if (!this.email.trim()) return 'E-mail é obrigatório.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) return 'Insira um e-mail válido.';
    return '';
  }

  get passwordError(): string {
    if (!this.submitted) return '';
    if (!this.password) return 'Senha é obrigatória.';
    if (this.password.length < 6) return 'A senha deve ter ao menos 6 caracteres.';
    return '';
  }

  get confirmPasswordError(): string {
    if (!this.submitted) return '';
    if (!this.confirmPassword) return 'Confirme sua senha.';
    if (this.confirmPassword !== this.password) return 'As senhas não coincidem.';
    return '';
  }

  get hasErrors(): boolean {
    return !!(this.nameError || this.emailError || this.passwordError || this.confirmPasswordError);
  }

  // ── Password strength (0–4) ────────────────────────────────

  get passwordStrength(): number {
    const p = this.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6)  score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p) || /[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }

  get passwordStrengthLabel(): string {
    return ['', 'Fraca', 'Regular', 'Boa', 'Forte'][this.passwordStrength];
  }

  // ── Actions ───────────────────────────────────────────────

  async onRegister() {
    this.submitted = true;
    this.errorMessage = '';
    if (this.hasErrors) return;

    this.loading = true;
    try {
      await this.authService.signUp(this.email, this.password);
      if (this.name.trim()) {
        await this.authService.updateUserProfile({ displayName: this.name.trim() });
      }
      await this.redirectToMainApp();
    } catch (err: any) {
      this.errorMessage = this.friendlyError(err.code);
      this.loading = false;
    }
  }

  async onGoogleRegister() {
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

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private async redirectToMainApp() {
    const token = await this.authService.getIdToken();
    window.location.href = `${environment.mainAppUrl}/auth/callback?token=${token}`;
  }

  private friendlyError(code: string): string {
    const map: Record<string, string> = {
      'auth/email-already-in-use': 'Este e-mail já está cadastrado. Tente fazer login.',
      'auth/invalid-email': 'Por favor, insira um e-mail válido.',
      'auth/weak-password': 'Senha muito fraca. Use ao menos 6 caracteres.',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
      'auth/popup-closed-by-user': 'Login com Google foi cancelado.',
    };
    return map[code] ?? 'Algo deu errado. Tente novamente.';
  }
}
