import { Component, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent, TextComponent } from '@senior-ease/ui';

@Component({
    selector: 'app-change-password',
    imports: [FormsModule, RouterLink, ButtonComponent, TextComponent],
    templateUrl: './change-password.component.html',
    styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  loading = false;

  async onChangePassword() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    this.loading = true;
    try {
      await this.authService.changePassword(this.newPassword);
      this.successMessage = 'Password changed successfully!';
      this.newPassword = '';
      this.confirmPassword = '';
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        this.errorMessage = 'Please sign out and sign back in before changing your password.';
      } else {
        this.errorMessage = 'Failed to change password. Please try again.';
      }
    } finally {
      this.loading = false;
    }
  }
}
