# Calendário de Casal - Backend Prototype

Este protótipo contém um backend Express que serve um PWA estático e fornece uma API em /api para setup, autenticação por PIN e gerenciamento de eventos (SQLite).

Principais pontos:
- DB: SQLite (arquivo, criado automaticamente)
- Autenticação: PINs hashed com bcrypt, sessão via JWT em cookie HttpOnly
- Proteção: rate-limiter no login
- Rotas: /api/setup, /api/auth/*, /api/events/*
- PWA assets em /public (manifest.json, service-worker.js, index.html, setup.html)

Como usar:
1. Copie `.env.sample` para `.env` e defina SESSION_SECRET.
2. Instale dependências: npm install
3. Inicie o servidor:
   - Produção: npm start
   - Desenvolvimento (recarregamento com nodemon): npm run dev

Variáveis de ambiente:
- PORT (padrão 3000)
- DATABASE_PATH (padrão ./data/db.sqlite)
- SESSION_SECRET (OBRIGATÓRIO)

API minimal:
- POST /api/setup { partner1Name, partner1Pin, partner2Name, partner2Pin }
- POST /api/auth/login { name, pin }
- POST /api/auth/logout
- GET /api/auth/me
- GET /api/events?start=ISO&end=ISO
- GET /api/events/:id
- POST /api/events (protegido)
- PUT /api/events/:id (protegido)
- DELETE /api/events/:id (protegido)

Os endpoints retornam JSON com erros padronizados, por exemplo:
{ "error": "mensagem", "code": "ERR_CODE" }