# Gravan — Marketplace de Obras Musicais

## Visão Geral
Plataforma premium que conecta compositores e compradores de obras musicais com suporte a pagamentos via Stripe e PayPal, autenticação via Supabase, e transcrição de áudio com faster-whisper.

## Arquitetura

### Backend (`backend/`)
- **Flask** (Python 3.11) rodando na porta **8000** via `python -m gunicorn`
- Logo da marca em `backend/assets/gravan-logo.png` (usada nos PDFs premium)
- Dossiê de Licença (cortesia ao comprador): `backend/services/dossie_licenca.py` →
  ZIP com letra em PDF (logo + tipografia premium), MP3 da composição (bucket `obras-audio`)
  e cópia do contrato. Rotas: `GET /api/contratos/licenciamento/<id>/dossie-licenca` (apenas
  o `buyer_id`) e `GET /api/contratos/licenciamento/by-transacao/<id>` (lookup pós-pagamento).
- Workflow: `cd backend && python -m gunicorn --bind=0.0.0.0:8000 --workers 2 --reuse-port 'app:create_app()'`
- Entrada: `backend/app.py` → `create_app()`
- Autenticação: Supabase Auth (JWT verificado no middleware `backend/middleware/auth.py`)
- Banco de dados: Supabase (PostgreSQL)
- Pagamentos: Stripe + PayPal
- Rate limiting: Flask-Limiter (Redis ou memória)
- Segurança: Flask-WTF CSRF, CORS configurado, headers de segurança

### Frontend (`frontend/`)
- **React + Vite** rodando na porta **5000**
- Workflow: `cd frontend && npm run dev`
- Proxy `/api/*` → `http://localhost:8000` (configurado no vite.config.js)
- Autenticação: `@supabase/supabase-js` via `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

## Variáveis de Ambiente Necessárias

### Secrets (configurados no Replit)
- `SUPABASE_URL` — URL do projeto Supabase
- `SUPABASE_SERVICE_KEY` — Chave de serviço do Supabase (backend)
- `SUPABASE_ANON_KEY` — Chave anônima do Supabase (backend)
- `VITE_SUPABASE_URL` — Mesmo valor de SUPABASE_URL (exposto ao frontend via Vite)
- `VITE_SUPABASE_ANON_KEY` — Mesmo valor de SUPABASE_ANON_KEY (exposto ao frontend via Vite)
- `STRIPE_SECRET_KEY` — Chave secreta do Stripe
- `STRIPE_WEBHOOK_SECRET` — Secret do webhook Stripe
- `STRIPE_CONNECT_WEBHOOK_SECRET` — Secret do webhook Stripe Connect
- `PAYPAL_CLIENT_ID` — Client ID do PayPal
- `PAYPAL_CLIENT_SECRET` — Client Secret do PayPal

### Env Vars (configuradas no Replit userenv.shared)
- `FLASK_SECRET_KEY` — Chave secreta Flask para sessões
- `PII_ENCRYPTION_KEY` — Chave de criptografia de dados pessoais
- `FLASK_ENV` — `development` ou `production`
- `ALLOWED_ORIGINS` — Origens permitidas pelo CORS
- `FRONTEND_URL` — URL base do frontend
- `SAQUE_CRON_SECRET` — Secret para o cron de saques
- `VITE_API_URL` — `/api`
- `VITE_API_BASE_URL` — `/api`

## Portas
- `5000` → Frontend (webview, porta externa 80)
- `8000` → Backend (console, porta externa 8000)

## Rotas Principais do Backend
Todos os blueprints registrados com prefixo `/api/*`:
- `/api/obras` — Obras musicais
- `/api/perfis` — Perfis de usuários
- `/api/catalogo` — Catálogo público
- `/api/transacoes` — Transações
- `/api/stripe` — Webhooks e pagamentos Stripe
- `/api/paypal` — Webhooks e pagamentos PayPal
- `/api/admin` — Painel administrativo
- `/api/analytics` — Métricas
- `/api/assinatura` — Assinaturas
- `/api/favoritos` — Favoritos
- `/api/ai` — Transcrição (Whisper) e geração de capas (Pollinations.ai)
- `/api/health` — Health check
