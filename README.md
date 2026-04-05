# SeniorEase Login — Microfrontend de Autenticação

**FIAP Pos Tech Hackathon**

Aplicação Angular responsável pelo login e cadastro de usuários do SeniorEase. Funciona como um **microfrontend independente**, separado da aplicação principal, e se comunica com ela via JWT (Firebase ID Token).

[IMAGEM AQUI — screenshot da tela de login]

---

## Sumário

- [Visão geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e execução](#instalação-e-execução)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Rotas](#rotas)
- [Fluxo de autenticação](#fluxo-de-autenticação)
- [Funcionalidades](#funcionalidades)
- [Integração com Firebase Auth](#integração-com-firebase-auth)
- [Dependências principais](#dependências-principais)
- [Scripts disponíveis](#scripts-disponíveis)

---

## Visão geral

Este app roda em **`localhost:4201`** e é acessado quando o usuário não está autenticado na aplicação principal (`localhost:4200`). Após autenticação bem-sucedida, gera um **Firebase ID Token (JWT)** e redireciona o usuário de volta ao shell principal via query string.

**Relação com a aplicação principal:**

```
Usuário não autenticado
        │
        ▼
SeniorEase (4200) ──► redireciona para ──► SeniorEase-login (4201)
                                                    │
                                          Login / Cadastro
                                                    │
                                          Gera JWT (Firebase ID Token)
                                                    │
                                                    ▼
                                     SeniorEase (4200)/auth/callback?token=<JWT>
```

---

## Pré-requisitos

- **Node.js** 20+ e **npm** 10+
- **Angular CLI** 21+: `npm install -g @angular/cli`
- Projeto Firebase configurado (Authentication habilitado com Email/Password e Google)

---

## Instalação e execução

```bash
# 1. Instalar dependências
npm install

# 2. Configurar Firebase
# Edite src/environments/environment.ts com as credenciais do Firebase

# 3. Rodar em desenvolvimento
npm start
# Acesse: http://localhost:4201
```

> O arquivo `angular.json` deve configurar a porta como `4201`. Verifique se há `"port": 4201` nas opções de serve.

---

## Estrutura de pastas

```
src/
├── app/
│   ├── components/
│   │   ├── login/
│   │   │   ├── login.component.ts       # Lógica de login (email/senha + Google)
│   │   │   ├── login.component.html     # Formulário de login
│   │   │   └── login.component.scss     # Estilos da tela de login
│   │   └── register/
│   │       ├── register.component.ts    # Lógica de cadastro
│   │       ├── register.component.html  # Formulário de cadastro
│   │       └── register.component.scss  # Estilos da tela de cadastro
│   ├── services/
│   │   └── auth.service.ts             # Wrapper do Firebase Auth
│   ├── app.component.ts                # Componente raiz
│   ├── app.config.ts                   # Configuração do Angular (providers, Firebase)
│   └── app.routes.ts                   # Definição de rotas
└── environments/
    ├── environment.ts                  # Configuração dev (Firebase + URL do app principal)
    └── environment.prod.ts             # Configuração de produção
```

---

## Rotas

| Caminho | Componente | Descrição |
|---------|-----------|-----------|
| `/login` | `LoginComponent` | Formulário de login |
| `/register` | `RegisterComponent` | Formulário de cadastro |
| `/` | — | Redireciona para `/login` |
| `/**` | — | Redireciona para `/login` |

---

## Fluxo de autenticação

### Login com e-mail e senha

1. Usuário preenche e-mail e senha
2. `AuthService.signIn()` chama `signInWithEmailAndPassword()` do Firebase
3. Sucesso: `getIdToken()` obtém o JWT
4. Redireciona para `{mainAppUrl}/auth/callback?token={JWT}`

### Login com Google

1. Usuário clica em "Entrar com Google"
2. `AuthService.signInWithGoogle()` abre popup do Google OAuth
3. Após autenticação: `getIdToken()` obtém o JWT
4. Redireciona para `{mainAppUrl}/auth/callback?token={JWT}`

### Cadastro

1. Usuário preenche nome, e-mail, senha e confirmação
2. Validações client-side (nome obrigatório, e-mail válido, senha mínima 6 chars, senhas coincidem)
3. `AuthService.signUp()` cria conta com `createUserWithEmailAndPassword()`
4. `AuthService.updateUserProfile()` salva o nome de exibição no Firebase Auth
5. `getIdToken(true)` obtém JWT **forçando refresh** (necessário para o nome aparecer no token)
6. Redireciona para `{mainAppUrl}/auth/callback?token={JWT}`

> **Por que `getIdToken(true)`?** O Firebase armazena o JWT em cache. Após `updateUserProfile()`, o token em cache ainda não contém o `displayName`. O parâmetro `true` força a geração de um novo token com os dados atualizados.

[IMAGEM AQUI — screenshot da tela de cadastro com indicador de força de senha]

---

## Funcionalidades

### Tela de Login

- Login com **e-mail e senha**
- Login com **Google** (OAuth popup)
- Exibição de erros amigáveis (sem mensagens técnicas do Firebase)
- Botão de mostrar/ocultar senha
- Link para tela de cadastro
- Loading state durante autenticação

### Tela de Cadastro

- Campos: **Nome**, **E-mail**, **Senha**, **Confirmar senha**
- **Indicador de força de senha** (0–4 níveis: Fraca / Regular / Boa / Forte)
  - Critérios: comprimento ≥ 6, comprimento ≥ 10, tem maiúscula ou número, tem caractere especial
- Validações inline (exibidas após primeiro submit)
- Cadastro com **Google** (cria ou vincula conta)
- Mensagens de erro amigáveis por código Firebase
- Link para tela de login

### Erros tratados

| Código Firebase | Mensagem exibida |
|----------------|-----------------|
| `auth/user-not-found` | Nenhuma conta encontrada com este e-mail |
| `auth/wrong-password` | Senha incorreta |
| `auth/invalid-credential` | E-mail ou senha inválidos |
| `auth/email-already-in-use` | Este e-mail já está cadastrado |
| `auth/weak-password` | Senha muito fraca |
| `auth/too-many-requests` | Muitas tentativas, tente mais tarde |
| `auth/popup-closed-by-user` | Login com Google foi cancelado |
| `auth/invalid-email` | Insira um e-mail válido |

---

## Integração com Firebase Auth

O `AuthService` é um wrapper sobre o SDK do Firebase Auth (`@angular/fire/auth`) que expõe:

```typescript
user$: Observable<User | null>   // Stream do usuário autenticado
currentUser: User | null          // Usuário atual (síncrono)

signUp(email, password)           // Criar conta
signIn(email, password)           // Login com e-mail/senha
signInWithGoogle()                // Login com Google popup
signOut()                         // Logout
changePassword(newPassword)       // Alterar senha
updateUserProfile({ displayName, photoURL })  // Atualizar perfil
sendPasswordReset(email)          // Enviar e-mail de redefinição
getIdToken(forceRefresh?)         // Obter JWT (forceRefresh = true após updateProfile)
```

---

## Dependências principais

| Pacote | Versão | Uso |
|--------|--------|-----|
| `@angular/core` | ^21.2.6 | Framework principal |
| `@angular/fire` | ^18.0.1 | Integração com Firebase Auth |
| `firebase` | ^10.14.1 | SDK do Firebase |
| `@senior-ease/ui` | ^0.1.8 | Biblioteca de componentes internos |
| `@fortawesome/angular-fontawesome` | ^4.0.0 | Ícones (Font Awesome 6) |
| `rxjs` | ~7.8.0 | Programação reativa |
| `zone.js` | ~0.15.1 | Change detection do Angular |

**Ferramentas de desenvolvimento:**

| Pacote | Uso |
|--------|-----|
| `jest` + `jest-preset-angular` | Testes unitários |
| `ts-jest` | TypeScript support para Jest |
| `prettier` | Formatação de código |
| `husky` + `lint-staged` | Git hooks (formata antes de commitar) |

---

## Scripts disponíveis

```bash
npm start          # Sobe o servidor de desenvolvimento (localhost:4201)
npm run build      # Build de produção
npm run watch      # Build em modo watch (desenvolvimento)
npm test           # Executa os testes com Jest
```

---

## Variáveis de ambiente

Configure o arquivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  mainAppUrl: 'http://localhost:4200',   // URL da aplicação principal
  firebase: {
    apiKey: '...',
    authDomain: '...',
    projectId: '...',
    storageBucket: '...',
    messagingSenderId: '...',
    appId: '...',
  }
};
```

> **Segurança:** As chaves de API do Firebase para projetos web são seguras para expor no cliente — o acesso ao Firestore é controlado pelas **Security Rules** do Firebase, não pela chave de API.
