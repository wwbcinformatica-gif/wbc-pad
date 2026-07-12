-- SQL alternativo que não requer permissão de política
-- Execute no SQL Editor do Supabase

-- 1. Apenas criar o perfil admin (sem modificar políticas)
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

-- 2. Verificar se o admin foi criado
SELECT id, email, name, role, subscription_status 
FROM profiles 
WHERE email = 'admin@wbc.com';

-- 3. Verificar todos os perfis
SELECT email, name, role, subscription_status 
FROM profiles 
ORDER BY created_at DESC;

-- 4. Se quiser apenas atualizar um perfil existente (alternativa)
UPDATE public.profiles 
SET role = 'admin', 
    subscription_status = 'active',
    name = 'Admin WBC',
    updated_at = NOW()
WHERE email = 'admin@wbc.com';

-- 5. Verificar resultado da atualização
SELECT id, email, name, role, subscription_status 
FROM profiles 
WHERE email = 'admin@wbc.com';