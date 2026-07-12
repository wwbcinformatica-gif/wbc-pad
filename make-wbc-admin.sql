-- SQL para transformar wwbcinformatica@gmail.com em admin
-- Execute no SQL Editor do Supabase

-- 1. Verificar se o perfil desse usuário existe
SELECT id, email, name, role, subscription_status 
FROM profiles 
WHERE email = 'wwbcinformatica@gmail.com';

-- 2. Criar ou atualizar o perfil com role de admin
INSERT INTO public.profiles (id, email, name, role, subscription_status, trial_ends_at)
VALUES (
  'c2927705-1fed-4106-892e-fe12aef18a79',
  'wwbcinformatica@gmail.com',
  'WBC Informática',
  'admin',
  'active',
  NOW() + INTERVAL '7 days'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  subscription_status = 'active',
  name = 'WBC Informática',
  updated_at = NOW();

-- 3. Se o perfil já existir, só atualizar o role
UPDATE public.profiles 
SET role = 'admin', 
    subscription_status = 'active',
    name = 'WBC Informática',
    updated_at = NOW()
WHERE email = 'wwbcinformatica@gmail.com';

-- 4. Verificar se o admin foi criado/ atualizado
SELECT id, email, name, role, subscription_status 
FROM profiles 
WHERE email = 'wwbcinformatica@gmail.com';

-- 5. Verificar todos os perfis para confirmar
SELECT email, name, role, subscription_status 
FROM profiles 
ORDER BY created_at DESC;

-- 6. Mensagem de confirmação
SELECT '✅ Usuário wwbcinformatica@gmail.com transformado em admin com sucesso!' as status;