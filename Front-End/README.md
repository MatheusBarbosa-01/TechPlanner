# TechPlanner — Frontend

**Agenda Acadêmica Digital** — Projeto de Extensão  
Curso: Engenharia de Software

## Equipe

| Nome | Função |
|------|--------|
| Brayan Vinícius Neves Gonçalves | Desenvolvedor |
| Gabriel Gomes Madeira | Desenvolvedor |
| Gustavo Marques Lopes Ribeiro | Desenvolvedor |
| Marco Antônio Brito Prado | Desenvolvedor |
| Matheus Barbosa Nunes | Desenvolvedor |
| Vitor Rodrigues Torres | Desenvolvedor |

**Orientador:** Marco Antônio Gabriel

---

## Tecnologias

- **React 19** — interface de usuário
- **Vite 6** — build tool e servidor de desenvolvimento
- **Firebase v12** — Authentication + Firestore + Analytics
- **React Router DOM v7** — roteamento SPA
- **React Icons** — ícones
- **Chakra UI v3** — sistema de componentes

---

## Estrutura do Projeto

```
src/
├── firebase/           # Configuração do Firebase
│   └── config.js
├── contexts/           # Context API
│   └── AuthContext.jsx # Autenticação global
├── hooks/              # Hooks customizados
│   └── useAuth.js
├── services/           # Camada de acesso ao Firestore
│   ├── activityService.js
│   ├── notificationService.js
│   └── userService.js
├── components/         # Componentes reutilizáveis
│   ├── Sidebar/        # Navegação lateral
│   ├── PrivateRoute.jsx
│   └── LoadingSpinner.jsx
├── pages/              # Páginas da aplicação
│   ├── Login/
│   ├── Register/
│   ├── Dashboard/
│   ├── Calendar/
│   ├── Activities/
│   └── CreateActivity/
└── styles/
    └── estilosGlobais.css
```

---

## Como Executar

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Entrar na pasta do frontend
cd Front-End

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

### Build para produção

```bash
npm run build
```

---

## Configuração do Firebase

O arquivo `src/firebase/config.js` já contém as credenciais do projeto.

Para o Firestore funcionar corretamente, crie as seguintes coleções no Console do Firebase:

### Coleção `classes` (turmas)

Crie documentos manualmente ou via seed. Exemplo:
```json
{
  "id": "ES2024-1",
  "name": "Engenharia de Software — 2024/1",
  "teacherId": "uid-do-professor"
}
```

### Regras do Firestore

Configure em Firebase Console > Firestore > Regras:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Usuários: leitura e escrita apenas do próprio perfil
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // para professores lerem alunos
    }

    // Turmas: leitura pública (autenticado), escrita apenas admin
    match /classes/{classId} {
      allow read: if request.auth != null;
    }

    // Atividades: leitura pública, escrita apenas professores/admin
    match /activities/{activityId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['professor', 'administrador'];
    }

    // Notificações: cada usuário lê e escreve apenas as suas
    match /notifications/{notifId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

---

## Funcionalidades

| Funcionalidade | Perfis |
|----------------|--------|
| Login / Cadastro | Todos |
| Dashboard com resumo | Todos |
| Calendário interativo | Todos |
| Lista de atividades | Todos |
| Criar atividade | Professor, Administrador |
| Editar atividade | Professor, Administrador |
| Excluir atividade | Professor, Administrador |
| Notificações em tempo real | Todos |


## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
