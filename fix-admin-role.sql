-- SQL completo para verificar e criar o admin
-- Execute no SQL Editor do Supabase

-- 1. Verificar se o perfil do admin existe
SELECT id, email, name, role, subscription_status 
FROM profiles 
WHERE email = 'admin@wbc.com';

-- 2. Se não existir, criar o perfil admin
INSERT INTO public.profiles (id, email, name, role, subscription_status, trial_ends_at)
VALUES (
  '7dfdfe08-4df1-4d3b-9363-1127b7a16905',
  'admin@wbc.com',
  'Admin WBC',
  'admin',
  'active',
  NOW() + INTERVAL '7 days'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  subscription_status = 'active',
  name = 'Admin WBC',
  updated_at = NOW();

-- 3. Se existir mas não for admin, atualizar
UPDATE public.profiles 
SET role = 'admin', 
    subscription_status = 'active',
    name = 'Admin WBC',
    updated_at = NOW()
WHERE email = 'admin@wbc.com' AND role != 'admin';

-- 4. Verificar resultado final
SELECT id, email, name, role, subscription_status 
FROM profiles 
WHERE email = 'admin@wbc.com';

-- 5. Verificar todos os perfis para confirmar
SELECT email, name, role, subscription_status 
FROM profiles 
ORDER BY created_at DESC;