import { Component, inject, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserConfigService, UserConfig } from '../../services/user-config.service';
import { ButtonComponent, TextComponent } from '@senior-ease/ui';

@Component({
    selector: 'app-user-settings',
    imports: [FormsModule, RouterLink, ButtonComponent, TextComponent],
    templateUrl: './user-settings.component.html',
    styleUrl: './user-settings.component.scss'
})
export class UserSettingsComponent implements OnInit {
  private configService = inject(UserConfigService);

  config: UserConfig = {
    displayName: '',
    theme: 'light',
    language: 'en',
    notifications: true
  };

  loading = true;
  saving = false;
  successMessage = '';
  errorMessage = '';

  async ngOnInit() {
    try {
      this.config = await this.configService.getConfig();
    } catch (err) {
      this.errorMessage = 'Failed to load settings.';
    } finally {
      this.loading = false;
    }
  }

  async onSave() {
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';
    try {
      await this.configService.saveConfig(this.config);
      this.successMessage = 'Settings saved!';
    } catch (err) {
      this.errorMessage = 'Failed to save settings.';
    } finally {
      this.saving = false;
    }
  }
}
