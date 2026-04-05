import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterComponent } from './register.component';

const mockAuthService = {
  signUp: jest.fn(),
  signInWithGoogle: jest.fn(),
  updateUserProfile: jest.fn().mockResolvedValue(undefined),
  getIdToken: jest.fn().mockResolvedValue('token-falso'),
};

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, FormsModule],
      providers: [
        provideRouter([{ path: 'login', redirectTo: '' }]),
        { provide: AuthService, useValue: mockAuthService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Renderização da tela de cadastro', () => {
    it('deve renderizar o formulário de registro na tela', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('form')).not.toBeNull();
    });

    it('deve renderizar o campo de nome', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('#name')).not.toBeNull();
    });

    it('deve renderizar o campo de e-mail', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('#email')).not.toBeNull();
    });

    it('deve renderizar o campo de senha', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('#password')).not.toBeNull();
    });

    it('deve renderizar o campo de confirmar senha', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('#confirmPassword')).not.toBeNull();
    });

    it('deve renderizar o botão de criar conta', () => {
      const el: HTMLElement = fixture.nativeElement;
      const botao = el.querySelector('button[type="submit"]');
      expect(botao).not.toBeNull();
      expect(botao?.textContent?.trim()).toContain('Criar conta');
    });

    it('deve renderizar o botão de cadastro com Google', () => {
      const el: HTMLElement = fixture.nativeElement;
      const botaoGoogle = el.querySelector('.btn-google');
      expect(botaoGoogle).not.toBeNull();
    });

    it('deve renderizar o link para voltar ao login', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Já tem uma conta?');
    });

    it('não deve exibir erros antes da tentativa de envio', () => {
      expect(component.submitted).toBe(false);
      expect(component.nameError).toBe('');
      expect(component.emailError).toBe('');
      expect(component.passwordError).toBe('');
      expect(component.confirmPasswordError).toBe('');
    });
  });

  describe('Estado inicial do componente', () => {
    it('deve iniciar com os campos vazios', () => {
      expect(component.name).toBe('');
      expect(component.email).toBe('');
      expect(component.password).toBe('');
      expect(component.confirmPassword).toBe('');
    });

    it('deve iniciar sem carregamento ativo', () => {
      expect(component.loading).toBe(false);
    });

    it('deve iniciar sem erros de submissão', () => {
      expect(component.submitted).toBe(false);
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Validações dos campos', () => {
    beforeEach(() => {
      component.submitted = true;
    });

    it('deve exibir erro quando o nome está vazio', () => {
      component.name = '';
      expect(component.nameError).toBe('Nome é obrigatório.');
    });

    it('deve exibir erro quando o nome tem menos de 2 caracteres', () => {
      component.name = 'A';
      expect(component.nameError).toBe('Nome deve ter ao menos 2 caracteres.');
    });

    it('não deve exibir erro quando o nome é válido', () => {
      component.name = 'Ana';
      expect(component.nameError).toBe('');
    });

    it('deve exibir erro quando o e-mail está vazio', () => {
      component.email = '';
      expect(component.emailError).toBe('E-mail é obrigatório.');
    });

    it('deve exibir erro para e-mail com formato inválido', () => {
      component.email = 'email-invalido';
      expect(component.emailError).toBe('Insira um e-mail válido.');
    });

    it('não deve exibir erro quando o e-mail é válido', () => {
      component.email = 'usuario@exemplo.com';
      expect(component.emailError).toBe('');
    });

    it('deve exibir erro quando a senha está vazia', () => {
      component.password = '';
      expect(component.passwordError).toBe('Senha é obrigatória.');
    });

    it('deve exibir erro quando a senha tem menos de 6 caracteres', () => {
      component.password = '123';
      expect(component.passwordError).toBe('A senha deve ter ao menos 6 caracteres.');
    });

    it('não deve exibir erro quando a senha é válida', () => {
      component.password = 'senha123';
      expect(component.passwordError).toBe('');
    });

    it('deve exibir erro quando a confirmação de senha está vazia', () => {
      component.password = 'senha123';
      component.confirmPassword = '';
      expect(component.confirmPasswordError).toBe('Confirme sua senha.');
    });

    it('deve exibir erro quando as senhas não coincidem', () => {
      component.password = 'senha123';
      component.confirmPassword = 'outrasenha';
      expect(component.confirmPasswordError).toBe('As senhas não coincidem.');
    });

    it('não deve exibir erro quando as senhas coincidem', () => {
      component.password = 'senha123';
      component.confirmPassword = 'senha123';
      expect(component.confirmPasswordError).toBe('');
    });

    it('hasErrors deve ser true quando há campos inválidos', () => {
      component.name = '';
      expect(component.hasErrors).toBe(true);
    });

    it('hasErrors deve ser false quando todos os campos são válidos', () => {
      component.name = 'Ana Silva';
      component.email = 'ana@exemplo.com';
      component.password = 'senha123';
      component.confirmPassword = 'senha123';
      expect(component.hasErrors).toBe(false);
    });
  });

  describe('Indicador de força da senha', () => {
    it('deve retornar 0 quando a senha está vazia', () => {
      component.password = '';
      expect(component.passwordStrength).toBe(0);
    });

    it('deve retornar 1 para senha curta (mínimo 6 caracteres)', () => {
      component.password = 'abc123';
      expect(component.passwordStrength).toBeGreaterThanOrEqual(1);
    });

    it('deve retornar pontuação maior para senha com letras maiúsculas e números', () => {
      component.password = 'Senha123';
      expect(component.passwordStrength).toBeGreaterThanOrEqual(2);
    });

    it('deve retornar pontuação máxima para senha forte', () => {
      component.password = 'Senha@Forte123!';
      expect(component.passwordStrength).toBe(4);
    });

    it('passwordStrengthLabel deve retornar "Fraca" para força 1', () => {
      component.password = 'abcdef';
      jest.spyOn(component, 'passwordStrength', 'get').mockReturnValue(1);
      expect(component.passwordStrengthLabel).toBe('Fraca');
    });

    it('passwordStrengthLabel deve retornar "Forte" para força 4', () => {
      jest.spyOn(component, 'passwordStrength', 'get').mockReturnValue(4);
      expect(component.passwordStrengthLabel).toBe('Forte');
    });

    it('passwordStrengthLabel deve retornar "Regular" para força 2', () => {
      jest.spyOn(component, 'passwordStrength', 'get').mockReturnValue(2);
      expect(component.passwordStrengthLabel).toBe('Regular');
    });

    it('passwordStrengthLabel deve retornar "Boa" para força 3', () => {
      jest.spyOn(component, 'passwordStrength', 'get').mockReturnValue(3);
      expect(component.passwordStrengthLabel).toBe('Boa');
    });
  });

  describe('onRegister', () => {
    it('não deve chamar authService.signUp quando o formulário é inválido', async () => {
      component.name = '';
      component.email = '';
      component.password = '';
      component.confirmPassword = '';

      await component.onRegister();

      expect(mockAuthService.signUp).not.toHaveBeenCalled();
    });

    it('deve chamar authService.signUp com e-mail e senha corretos quando o formulário é válido', async () => {
      mockAuthService.signUp.mockResolvedValue({});

      component.name = 'Ana Silva';
      component.email = 'ana@exemplo.com';
      component.password = 'senha123';
      component.confirmPassword = 'senha123';

      await component.onRegister();

      expect(mockAuthService.signUp).toHaveBeenCalledWith('ana@exemplo.com', 'senha123');
    });

    it('deve chamar updateUserProfile com o nome após cadastro bem-sucedido', async () => {
      mockAuthService.signUp.mockResolvedValue({});

      component.name = 'Ana Silva';
      component.email = 'ana@exemplo.com';
      component.password = 'senha123';
      component.confirmPassword = 'senha123';

      await component.onRegister();

      expect(mockAuthService.updateUserProfile).toHaveBeenCalledWith({ displayName: 'Ana Silva' });
    });

    it('deve exibir erro quando o e-mail já está cadastrado', async () => {
      mockAuthService.signUp.mockRejectedValue({ code: 'auth/email-already-in-use' });

      component.name = 'Ana Silva';
      component.email = 'existente@exemplo.com';
      component.password = 'senha123';
      component.confirmPassword = 'senha123';

      await component.onRegister();

      expect(component.errorMessage).toBe(
        'Este e-mail já está cadastrado. Tente fazer login.',
      );
    });

    it('deve resetar o loading após falha no cadastro', async () => {
      mockAuthService.signUp.mockRejectedValue({ code: 'auth/weak-password' });

      component.name = 'Ana';
      component.email = 'ana@exemplo.com';
      component.password = '123456';
      component.confirmPassword = '123456';

      await component.onRegister();

      expect(component.loading).toBe(false);
    });
  });

  describe('goToLogin', () => {
    it('deve navegar para a rota de login', () => {
      const router = TestBed.inject(Router);
      const navigateSpy = jest.spyOn(router, 'navigate');

      component.goToLogin();

      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });
});
