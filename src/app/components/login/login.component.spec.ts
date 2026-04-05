import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from './login.component';

const mockAuthService = {
  signIn: jest.fn(),
  signInWithGoogle: jest.fn(),
  getIdToken: jest.fn().mockResolvedValue('token-falso'),
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule],
      providers: [
        provideRouter([{ path: 'register', redirectTo: '' }]),
        { provide: AuthService, useValue: mockAuthService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Renderização da tela de login', () => {
    it('deve renderizar o título "Bem-vindo de volta"', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Bem-vindo de volta');
    });

    it('deve renderizar o campo de e-mail', () => {
      const el: HTMLElement = fixture.nativeElement;
      const emailInput = el.querySelector('#email') as HTMLInputElement;
      expect(emailInput).not.toBeNull();
      expect(emailInput.type).toBe('email');
    });

    it('deve renderizar o campo de senha', () => {
      const el: HTMLElement = fixture.nativeElement;
      const passwordInput = el.querySelector('#password') as HTMLInputElement;
      expect(passwordInput).not.toBeNull();
    });

    it('deve renderizar o botão de entrar', () => {
      const el: HTMLElement = fixture.nativeElement;
      const botaoEntrar = el.querySelector('button[type="submit"]');
      expect(botaoEntrar).not.toBeNull();
      expect(botaoEntrar?.textContent?.trim()).toContain('Entrar');
    });

    it('deve renderizar o botão de login com Google', () => {
      const el: HTMLElement = fixture.nativeElement;
      const botaoGoogle = el.querySelector('.btn-google');
      expect(botaoGoogle).not.toBeNull();
      expect(botaoGoogle?.textContent).toContain('Continuar com Google');
    });

    it('deve renderizar o link para criar conta', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Criar conta');
    });

    it('não deve exibir mensagem de erro inicialmente', () => {
      const el: HTMLElement = fixture.nativeElement;
      const errorBanner = el.querySelector('.error-banner');
      expect(errorBanner).toBeNull();
    });
  });

  describe('Estado inicial do componente', () => {
    it('deve iniciar com os campos de e-mail e senha vazios', () => {
      expect(component.email).toBe('');
      expect(component.password).toBe('');
    });

    it('deve iniciar sem mensagem de erro', () => {
      expect(component.errorMessage).toBe('');
    });

    it('deve iniciar sem carregamento ativo', () => {
      expect(component.loading).toBe(false);
    });

    it('deve iniciar com a senha oculta', () => {
      expect(component.showPassword).toBe(false);
    });
  });

  describe('Funcionalidade de alternar visibilidade da senha', () => {
    it('deve alternar showPassword ao clicar no botão de mostrar senha', () => {
      const el: HTMLElement = fixture.nativeElement;
      const toggleBtn = el.querySelector('.password-toggle') as HTMLButtonElement;

      expect(component.showPassword).toBe(false);
      toggleBtn.click();
      fixture.detectChanges();
      expect(component.showPassword).toBe(true);
    });

    it('deve exibir a senha como texto quando showPassword é true', () => {
      component.showPassword = true;
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      const passwordInput = el.querySelector('#password') as HTMLInputElement;
      expect(passwordInput.type).toBe('text');
    });

    it('deve ocultar a senha quando showPassword é false', () => {
      component.showPassword = false;
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      const passwordInput = el.querySelector('#password') as HTMLInputElement;
      expect(passwordInput.type).toBe('password');
    });
  });

  describe('onLogin', () => {
    it('deve chamar authService.signIn com e-mail e senha corretos', async () => {
      mockAuthService.signIn.mockResolvedValue({});

      component.email = 'usuario@exemplo.com';
      component.password = 'senha123';

      await component.onLogin();

      expect(mockAuthService.signIn).toHaveBeenCalledWith('usuario@exemplo.com', 'senha123');
    });

    it('deve exibir mensagem de erro amigável para credenciais inválidas', async () => {
      mockAuthService.signIn.mockRejectedValue({ code: 'auth/invalid-credential' });

      component.email = 'usuario@exemplo.com';
      component.password = 'senha-errada';

      await component.onLogin();

      expect(component.errorMessage).toBe('E-mail ou senha inválidos.');
    });

    it('deve exibir mensagem de erro para usuário não encontrado', async () => {
      mockAuthService.signIn.mockRejectedValue({ code: 'auth/user-not-found' });

      component.email = 'inexistente@exemplo.com';
      component.password = 'senha123';

      await component.onLogin();

      expect(component.errorMessage).toBe('Nenhuma conta encontrada com este e-mail.');
    });

    it('deve exibir mensagem de erro padrão para erros desconhecidos', async () => {
      mockAuthService.signIn.mockRejectedValue({ code: 'auth/erro-desconhecido' });

      await component.onLogin();

      expect(component.errorMessage).toBe('Algo deu errado. Tente novamente.');
    });

    it('deve exibir mensagem de erro ao falhar e resetar o loading', async () => {
      mockAuthService.signIn.mockRejectedValue({ code: 'auth/wrong-password' });

      await component.onLogin();

      expect(component.loading).toBe(false);
      expect(component.errorMessage).toBe('Senha incorreta.');
    });

    it('deve exibir o banner de erro na tela após falha no login', async () => {
      mockAuthService.signIn.mockRejectedValue({ code: 'auth/invalid-credential' });
      component.email = 'usuario@exemplo.com';
      component.password = 'errado';

      await component.onLogin();
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const errorBanner = el.querySelector('.error-banner');
      expect(errorBanner).not.toBeNull();
      expect(errorBanner?.textContent).toContain('E-mail ou senha inválidos.');
    });
  });

  describe('onGoogleLogin', () => {
    it('deve chamar authService.signInWithGoogle', async () => {
      mockAuthService.signInWithGoogle.mockResolvedValue({});

      await component.onGoogleLogin();

      expect(mockAuthService.signInWithGoogle).toHaveBeenCalledTimes(1);
    });

    it('deve exibir mensagem de erro quando o login com Google falha', async () => {
      mockAuthService.signInWithGoogle.mockRejectedValue({ code: 'auth/popup-closed-by-user' });

      await component.onGoogleLogin();

      expect(component.errorMessage).not.toBe('');
    });
  });

  describe('goToRegister', () => {
    it('deve navegar para a rota de registro', () => {
      const router = TestBed.inject(Router);
      const navigateSpy = jest.spyOn(router, 'navigate');

      component.goToRegister();

      expect(navigateSpy).toHaveBeenCalledWith(['/register']);
    });
  });
});
