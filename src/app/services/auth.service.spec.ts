import { TestBed } from '@angular/core/testing';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { AuthService } from './auth.service';

jest.mock('@angular/fire/auth', () => ({
  Auth: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  updatePassword: jest.fn(),
  updateProfile: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({})),
  user: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
}));

const mockUser = {
  getIdToken: jest.fn().mockResolvedValue('id-token-falso'),
  email: 'teste@exemplo.com',
  displayName: 'Teste',
};

const mockAuth = {
  currentUser: null as typeof mockUser | null,
};

describe('AuthService (SeniorEase-login)', () => {
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.currentUser = null;

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Auth, useValue: mockAuth },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('currentUser', () => {
    it('deve retornar null quando não há usuário autenticado', () => {
      mockAuth.currentUser = null;
      expect(service.currentUser).toBeNull();
    });

    it('deve retornar o usuário atual quando autenticado', () => {
      mockAuth.currentUser = mockUser;
      expect(service.currentUser).toBe(mockUser);
    });
  });

  describe('signUp', () => {
    it('deve chamar createUserWithEmailAndPassword com e-mail e senha', () => {
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });

      service.signUp('novo@exemplo.com', 'senha123');

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'novo@exemplo.com',
        'senha123',
      );
    });
  });

  describe('signIn', () => {
    it('deve chamar signInWithEmailAndPassword com e-mail e senha', () => {
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });

      service.signIn('usuario@exemplo.com', 'senha123');

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'usuario@exemplo.com',
        'senha123',
      );
    });
  });

  describe('signInWithGoogle', () => {
    it('deve chamar signInWithPopup', () => {
      (signInWithPopup as jest.Mock).mockResolvedValue({ user: mockUser });

      service.signInWithGoogle();

      expect(signInWithPopup).toHaveBeenCalledTimes(1);
    });
  });

  describe('signOut', () => {
    it('deve chamar signOut do Firebase', () => {
      (signOut as jest.Mock).mockResolvedValue(undefined);

      service.signOut();

      expect(signOut).toHaveBeenCalledWith(mockAuth);
    });
  });

  describe('changePassword', () => {
    it('deve rejeitar a promessa quando não há usuário autenticado', async () => {
      mockAuth.currentUser = null;

      await expect(service.changePassword('nova-senha')).rejects.toThrow(
        'No user is currently signed in.',
      );
    });

    it('deve chamar updatePassword quando há usuário autenticado', () => {
      mockAuth.currentUser = mockUser;
      (updatePassword as jest.Mock).mockResolvedValue(undefined);

      service.changePassword('nova-senha');

      expect(updatePassword).toHaveBeenCalledWith(mockUser, 'nova-senha');
    });
  });

  describe('updateUserProfile', () => {
    it('deve rejeitar a promessa quando não há usuário autenticado', async () => {
      mockAuth.currentUser = null;

      await expect(service.updateUserProfile({ displayName: 'Novo Nome' })).rejects.toThrow(
        'No user is currently signed in.',
      );
    });

    it('deve chamar updateProfile quando há usuário autenticado', () => {
      mockAuth.currentUser = mockUser;
      (updateProfile as jest.Mock).mockResolvedValue(undefined);

      service.updateUserProfile({ displayName: 'Novo Nome' });

      expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'Novo Nome' });
    });
  });

  describe('sendPasswordReset', () => {
    it('deve chamar sendPasswordResetEmail com o e-mail fornecido', () => {
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      service.sendPasswordReset('usuario@exemplo.com');

      expect(sendPasswordResetEmail).toHaveBeenCalledWith(mockAuth, 'usuario@exemplo.com');
    });
  });

  describe('getIdToken', () => {
    it('deve rejeitar a promessa quando não há usuário autenticado', async () => {
      mockAuth.currentUser = null;

      await expect(service.getIdToken()).rejects.toThrow('No user signed in.');
    });

    it('deve retornar o token do usuário autenticado', async () => {
      mockAuth.currentUser = mockUser;

      const token = await service.getIdToken();

      expect(token).toBe('id-token-falso');
      expect(mockUser.getIdToken).toHaveBeenCalledTimes(1);
    });
  });
});
