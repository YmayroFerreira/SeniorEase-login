import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';

export interface UserConfig {
  displayName: string;
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
  [key: string]: any; // allow arbitrary extra settings
}

const DEFAULT_CONFIG: UserConfig = {
  displayName: '',
  theme: 'light',
  language: 'en',
  notifications: true
};

@Injectable({ providedIn: 'root' })
export class UserConfigService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  /** Get the Firestore document reference for the current user's config */
  private getUserConfigRef() {
    const uid = this.authService.currentUser?.uid;
    if (!uid) throw new Error('User not authenticated');
    return doc(this.firestore, `userConfigs/${uid}`);
  }

  /** Load config from Firestore (creates defaults if none exist) */
  async getConfig(): Promise<UserConfig> {
    const ref = this.getUserConfigRef();
    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
      // Merge defaults with stored data so any new fields added later
      // are available for existing users without breaking their saved values
      return { ...DEFAULT_CONFIG, ...snapshot.data() } as UserConfig;
    }

    // First time — seed with defaults
    await setDoc(ref, DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG };
  }

  /** Overwrite the entire config */
  async saveConfig(config: UserConfig): Promise<void> {
    const ref = this.getUserConfigRef();
    await setDoc(ref, config);
  }

  /** Partially update specific fields */
  async updateConfig(partial: Partial<UserConfig>): Promise<void> {
    const ref = this.getUserConfigRef();
    await updateDoc(ref, partial);
  }
}
