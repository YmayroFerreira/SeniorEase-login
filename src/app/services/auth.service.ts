import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updatePassword,
  updateProfile,
  sendPasswordResetEmail,
  User,
  user
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private googleProvider = new GoogleAuthProvider();

  /** Observable of the currently signed-in user (null when signed out) */
  user$: Observable<User | null> = user(this.auth);

  /** Get the current user synchronously */
  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  /** Create a new account with email + password */
  signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  /** Sign in with email + password */
  signIn(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  /** Sign in with Google popup */
  signInWithGoogle() {
    return signInWithPopup(this.auth, this.googleProvider);
  }

  /** Sign out */
  signOut() {
    return signOut(this.auth);
  }

  /** Change password (user must be recently authenticated) */
  changePassword(newPassword: string) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      return Promise.reject(new Error('No user is currently signed in.'));
    }
    return updatePassword(currentUser, newPassword);
  }

  /** Update the Firebase Auth profile (displayName, photoURL) */
  updateUserProfile(profile: { displayName?: string; photoURL?: string }) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      return Promise.reject(new Error('No user is currently signed in.'));
    }
    return updateProfile(currentUser, profile);
  }

  /** Send a password-reset email */
  sendPasswordReset(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }
}
