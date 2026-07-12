# Atualizações do Sistema

## 1. Correção: Botão de Excluir na Lista de Compras (Checklist)

**Problema:** No celular, os botões de editar, fixar e excluir não apareciam porque usavam `opacity-0 group-hover:opacity-100` (hover não existe em telas touch).

**Arquivos alterados:**
- `src/app/dashboard/checklist/page.tsx` — Removeu `opacity-0 group-hover:opacity-100 transition-opacity` do container dos botões de ação nos cards.
- `src/app/dashboard/checklist/[id]/edit/page.tsx` — Removeu `opacity-0 group-hover:opacity-100` do botão de remover item.

**Efeito:** Os botões agora ficam sempre visíveis em qualquer dispositivo.

---

## 2. Proxy (Middleware) Ativado

**Problema:** O arquivo `src/proxy.ts` existia mas nunca era executado como middleware do Next.js, deixando as rotas protegidas sem verificação server-side.

**Arquivos alterados:**
- `src/proxy.ts` — Renomeado de volta para `proxy.ts` (estava `middleware.ts`) e função renomeada para `proxy`, conforme convenção do Next.js 16.

**Efeito:** Agora o proxy é executado em todas as requisições. Usuários não autenticados são redirecionados para `/login` antes de qualquer rota protegida ser carregada.

---

## 3. Correção: Secrets no `.env.example`

**Problema:** O arquivo `.env.example` continha valores reais de produção (MP_WEBHOOK_SECRET, NEXT_PUBLIC_MP_PUBLIC_KEY).

**Arquivos alterados:**
- `.env.example` — Substituídos valores reais por placeholders (`your-public-key`, `your-access-token`, `your-webhook-secret`).

---

## 4. Criptografia de Dados Sensíveis (Vault)

### 4.1. Módulo de Criptografia

**Novo arquivo:** `src/lib/vault-crypto.ts`

Implementa criptografia AES-256-GCM usando Web Crypto API:

| Função | Descrição |
|---|---|
| `generateSalt()` | Gera salt aleatório de 32 bytes |
| `deriveKey(masterPassword, salt)` | Deriva chave AES-256 via PBKDF2 com 600.000 iterações SHA-256 |
| `encrypt(plaintext, key)` | Criptografa texto com AES-256-GCM + IV aleatório de 12 bytes |
| `decrypt(ciphertext, key)` | Descriptografa texto |
| `createVerificationHash(masterPassword, salt)` | Cria hash de verificação para validar a chave mestra |

**Fluxo:**
- O usuário cria uma **Chave Mestra** na primeira vez que acessa as senhas
- A chave é usada para derivar uma chave AES-256 via PBKDF2
- Todos os campos sensíveis são criptografados **no navegador** antes de enviar ao Supabase
- No banco de dados, os dados ficam armazenados como ciphertext ilegível
- Ao carregar, os dados são descriptografados no navegador antes de exibir

### 4.2. Gerenciamento do Vault

**Novo arquivo:** `src/lib/vault.ts`

Gerencia o estado da chave de criptografia em memória:
- `isVaultUnlocked()` — Verifica se o vault está desbloqueado
- `getVaultKey()` — Obtém a chave de criptografia atual
- `unlockVault(key)` — Define a chave (desbloqueia)
- `lockVault()` — Remove a chave (bloqueia)

**Segurança:** A chave mestra nunca é armazenada em disco, localStorage ou cookies. Permanece apenas na memória durante a sessão.

### 4.3. Componente de Desbloqueio

**Novo arquivo:** `src/components/vault-unlock.tsx`

Componente React que:
- Detecta se o vault está configurado ou bloqueado
- Tela de **primeiro acesso**: solicita criação da chave mestra com confirmação
- Tela de **desbloqueio**: solicita a chave mestra e valida via hash
- Salva o salt e hash de verificação no metadata do usuário (`user_metadata`) no Supabase Auth
- Após desbloqueio, renderiza o conteúdo protegido

### 4.4. Páginas Modificadas

**`src/app/dashboard/passwords/[category]/page.tsx`**
- Envolto com `<VaultUnlock>` — usuário precisa desbloquear antes de ver as senhas
- Ao carregar as entradas, descriptografa os campos usando a chave do vault

**`src/app/dashboard/passwords/[category]/new/page.tsx`**
- Antes de salvar, criptografa todos os campos com a chave do vault

**`src/app/dashboard/passwords/[category]/[id]/edit/page.tsx`**
- Ao carregar, descriptografa os campos
- Antes de salvar, criptografa novamente

### Formato de Armazenamento

Os dados criptografados são armazenados no campo `fields` do Supabase como:
```json
{
  "_encrypted": "base64(iv + ciphertext)"
}
```

Dados legados (sem `_encrypted`) continuam funcionando normalmente.

---

## 5. Deploy

**Comandos executados:**
```bash
git init
git add .
git commit -m "feat: adiciona criptografia AES-256-GCM, ativa proxy e corrige env.example"
vercel deploy --prod --yes
```

**URL de produção:** https://wbc-notepad.vercel.app

---

## 6. Ajustes Responsivos para Mobile

**Problema:** Textos vazavam para fora da área de visualização em celulares, exigindo rolagem horizontal para ler.

### Correções aplicadas:

| Problema | Arquivos | Correção |
|---|---|---|
| Toolbar do editor de caderno não rolava horizontalmente | `src/components/caderno-editor.tsx` | Adicionado `overflow-x-auto` na toolbar |
| Cards de agenda com padding direito excessivo | `src/app/dashboard/agenda/page.tsx` | `pr-20` → `pr-4 lg:pr-20` |
| Search bars com largura fixa `w-56` | `checklist/page.tsx`, `notes/page.tsx`, `caderno/page.tsx`, `agenda/page.tsx` | `w-56` → `w-full md:w-56` |
| Texto `font-mono` sem quebra de linha | `credit-card-3d.tsx`, `bank-account-card.tsx`, `document-card.tsx`, `passwords/[category]/page.tsx` | Adicionado `break-words` em campos longos (senhas, números de cartão, chaves PIX) |
| Grids de 2 colunas sem empilhamento em mobile | `notes/[id]/edit/page.tsx`, `agenda/[id]/edit/page.tsx`, `admin/page.tsx` | `grid-cols-2` → `grid-cols-1 sm:grid-cols-2` |
| Grids de 3 colunas em documentos muito apertados | `document-card.tsx` | `grid-cols-3` → `grid-cols-2 sm:grid-cols-3` |
| Label de senhas com largura mínima fixa | `passwords/[category]/page.tsx` | `min-w-[80px]` → `min-w-[60px] sm:min-w-[80px]` |
| Markdown sem proteção de overflow | `caderno/[id]/page.tsx` | Adicionado `overflow-x-auto break-words` |

---

## 7. Instalação do Aplicativo (PWA / Atalho)

**Novo arquivo:** `src/components/install-app.tsx`

Adicionado na página de Configurações (`/dashboard/settings`):

- **Instalar como aplicativo** — Botão que aciona o prompt de instalação do navegador (Chrome/Edge) para PWA
- **Instalar no iPhone/iPad** — Instruções passo-a-passo para adicionar à Tela de Início pelo Safari
- **Atalho para área de trabalho** — Download de arquivo `.url` (Windows) ou `.webloc` (Mac) com ícone e link do app

---

## Arquivos Criados

| Arquivo | Descrição |
|---|---|
| `src/lib/vault-crypto.ts` | Módulo de criptografia AES-256-GCM + PBKDF2 |
| `src/lib/vault.ts` | Gerenciamento de estado do vault |
| `src/components/vault-unlock.tsx` | Componente de desbloqueio do vault |
| `src/components/install-app.tsx` | Componente de instalação do app / atalho |

## Arquivos Modificados

| Arquivo | Descrição |
|---|---|
| `src/proxy.ts` | Renomeado e função renomeada para `proxy` |
| `.env.example` | Secrets reais substituídos por placeholders |
| `src/app/dashboard/checklist/page.tsx` | Botões de ação sempre visíveis |
| `src/app/dashboard/checklist/[id]/edit/page.tsx` | Botão remover item sempre visível |
| `src/app/dashboard/passwords/[category]/page.tsx` | Vault unlock + descriptografia |
| `src/app/dashboard/passwords/[category]/new/page.tsx` | Criptografia ao salvar |
| `src/app/dashboard/passwords/[category]/[id]/edit/page.tsx` | Descriptografia + criptografia |
| `src/components/credit-card-3d.tsx` | `break-words` em número do cartão |
| `src/components/bank-account-card.tsx` | `break-words` em agência/conta/senha/PIX |
| `src/components/document-card.tsx` | `break-words` + grids responsivos |
| `src/components/caderno-editor.tsx` | `overflow-x-auto` na toolbar |
| `src/app/dashboard/agenda/page.tsx` | Search `w-full md:w-56`, card `pr-4 lg:pr-20` |
| `src/app/dashboard/checklist/page.tsx` | Search `w-full md:w-56` |
| `src/app/dashboard/notes/page.tsx` | Search `w-full md:w-56` |
| `src/app/dashboard/caderno/page.tsx` | Search `w-full md:w-56` |
| `src/app/dashboard/caderno/[id]/page.tsx` | `overflow-x-auto break-words` no markdown |
| `src/app/dashboard/notes/[id]/edit/page.tsx` | Grids responsivos `sm:grid-cols-2` |
| `src/app/dashboard/agenda/[id]/edit/page.tsx` | Grid responsivo `sm:grid-cols-2` |
| `src/app/dashboard/admin/page.tsx` | Grids responsivos no modal de edição |
| `src/app/dashboard/settings/page.tsx` | Seção "Instalar Aplicativo" adicionada |
