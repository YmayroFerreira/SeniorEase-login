import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserConfigService, UserConfig } from '../../services/user-config.service';
import { ButtonComponent, TextComponent } from '@senior-ease/ui';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, ButtonComponent, TextComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private configService = inject(UserConfigService);
  private router = inject(Router);

  user$ = this.authService.user$;
  config: UserConfig | null = null;

  async ngOnInit() {
    try {
      this.config = await this.configService.getConfig();
    } catch {
      // Config not available yet — that's fine, we fall back to Auth profile
    }
  }

  get displayName(): string {
    return (
      this.config?.displayName ||
      this.authService.currentUser?.displayName ||
      this.authService.currentUser?.email ||
      'User'
    );
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  async onSignOut() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
