# WBC NotePad - Caderno Digital de Senhas

Transforme o caderno de senhas físico em um app online com assinatura.

## Stack

- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Pagamento:** Mercado Pago (assinaturas)
- **Deploy:** Vercel
- **PWA:** Instalável como app no celular

## Funcionalidades

- Landing page com identidade WBC
- Autenticação (email/senha)
- 8 categorias de senha: Wi-Fi, Cartão, Sites, Documentos, Contas, Email, SSH, Outros
- CRUD completo de senhas
- Copiar/mostrar/esconder senhas
- Período de teste grátis (7 dias)
- Assinatura mensal via Mercado Pago
- Painel admin (gerenciar usuários)
- PWA (instalável como app)
- Design responsivo

## Setup

### 1. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o conteúdo do arquivo `supabase-schema.sql`
3. Vá em **Settings > API** e copie a **URL** e **Anon Key**

### 2. Configurar Mercado Pago

1. Crie uma conta em [mercadopago.com.br](https://mercadopago.com.br)
2. Vá em **Desenvolvedores > Credenciais**
3. Copie a **Public Key** e o **Access Token**

### 3. Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
NEXT_PUBLIC_MP_PUBLIC_KEY=sua-public-key
MP_ACCESS_TOKEN=seu-access-token
```

### 4. Instalar e Rodar

```bash
npm install
npm run dev
```

### 5. Criar Admin

Após criar seu usuário, execute no SQL Editor do Supabase:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'seu@email.com';
```

### 6. Deploy no Vercel

```bash
npm run build
# Faça deploy no Vercel conectando o repositório
```

Configure as variáveis de ambiente no Vercel igual ao `.env.local`.

## Webhook Mercado Pago

No painel do Mercado Pago, configure o webhook:

- **URL:** `https://seu-dominio.vercel.app/api/webhooks/mercadopago`
- **Eventos:** `payment`

## Estrutura do Projeto

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Layout global
│   ├── manifest.ts           # PWA manifest
│   ├── login/                # Login
│   ├── register/             # Cadastro
│   ├── forgot-password/      # Recuperar senha
│   ├── reset-password/       # Redefinir senha
│   ├── dashboard/
│   │   ├── page.tsx          # Dashboard (categorias)
│   │   ├── layout.tsx        # Layout do dashboard
│   │   ├── passwords/
│   │   │   └── [category]/
│   │   │       ├── page.tsx      # Listar registros
│   │   │       ├── new/page.tsx  # Novo registro
│   │   │       └── [id]/edit/    # Editar registro
│   │   ├── admin/page.tsx    # Painel admin
│   │   └── subscription/     # Gerenciar assinatura
│   └── api/webhooks/mercadopago/  # Webhook MP
├── components/ui/            # Componentes reutilizáveis
├── lib/                      # Utilitários (supabase, etc.)
├── types/                    # Tipos TypeScript
└── proxy.ts                  # Auth middleware
```
