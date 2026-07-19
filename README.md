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
- Caderno de anotações com editor rich text (negrito, itálico, riscado, checkbox)
- Códigos com syntax highlighting (múltiplas linguagens)
- Lista de compras com emojis, categorias e upload de ícones
- Agenda com compromissos, horários e lembretes
- Período de teste grátis configurável (admin)
- Assinatura mensal via Mercado Pago
- Painel admin (gerenciar usuários, configurar trial, planos personalizados)
- Cofre com criptografia AES-GCM (proteção extra para senhas)
- Backup e exportação de dados (JSON e TXT)
- PWA instalável como app no celular
- Temas visuais (claro/escuro para editor de código)
- Sistema de som personalizável (10 tipos de som)
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
│   ├── proxy.ts              # Proxy (middleware) para auth
│   ├── login/                # Login
│   ├── register/             # Cadastro
│   ├── forgot-password/      # Recuperar senha
│   ├── reset-password/       # Redefinir senha
│   ├── dashboard/
│   │   ├── page.tsx          # Dashboard (categorias)
│   │   ├── layout.tsx        # Layout do dashboard
│   │   ├── passwords/
│   │   │   └── [category]/
│   │   │       ├── page.tsx      # Listar registros (com VaultUnlock)
│   │   │       ├── new/page.tsx  # Novo registro
│   │   │       └── [id]/edit/    # Editar registro
│   │   ├── caderno/          # Caderno de anotações
│   │   ├── codigos/          # Editor de código
│   │   ├── checklist/        # Lista de compras
│   │   ├── notes/            # Notas rápidas
│   │   ├── agenda/           # Agenda/calendário
│   │   ├── admin/page.tsx    # Painel admin
│   │   ├── settings/         # Configurações
│   │   ├── subscription/     # Gerenciar assinatura
│   │   └── backup/           # Backup dos dados
│   └── api/
│       ├── config/                # Configurações globais (trial)
│       ├── webhooks/mercadopago/  # Webhook MP
│       └── mercadopago/           # API Mercado Pago
├── components/
│   ├── ui/                   # Componentes reutilizáveis
│   ├── caderno-editor.tsx    # Editor do caderno
│   ├── code-editor.tsx       # Editor de código
│   ├── markdown-renderer.tsx # Renderizador markdown
│   ├── credit-card-3d.tsx    # Visualização cartão 3D
│   ├── bank-account-card.tsx # Card conta bancária
│   ├── document-card.tsx     # Card documentos
│   └── vault-unlock.tsx      # Tela de desbloqueio do vault
├── contexts/
│   ├── vault-context.tsx     # Contexto do cofre
│   ├── sound-context.tsx     # Contexto de sons
│   ├── font-size-context.tsx # Tamanho da fonte
│   └── code-theme-context.tsx# Tema do editor de código
├── lib/
│   ├── supabase.ts           # Cliente Supabase (browser)
│   ├── supabase-server.ts    # Cliente Supabase (server)
│   ├── supabase-middleware.ts# Middleware de auth
│   ├── supabase-admin.ts     # Cliente admin (service role)
│   ├── vault.ts              # Gerenciamento do cofre (chave em memória)
│   ├── vault-crypto.ts       # Criptografia AES-GCM do cofre
│   ├── mercadopago.ts        # Integração Mercado Pago
│   ├── sounds.ts             # Sistema de sons
│   ├── themes.ts             # Temas visuais
│   └── utils.ts              # Utilitários
├── data/
│   ├── shopping-items.ts     # Itens de supermercado
│   └── custom-shopping-items.ts # Itens personalizados
├── types/
│   └── index.ts              # Tipos TypeScript
└── public/
    └── sw.js                 # Service worker (PWA)
```
