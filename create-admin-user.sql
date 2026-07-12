-- SQL para criar usuário admin de teste
-- Execute no SQL Editor do Supabase

-- 1. Criar usuário auth (execute no Auth > Users do Supabase)
-- Crie manualmente um usuário com email: admin@wbc.com
-- Ou execute este SQL (depende da sua versão do Supabase):

-- 2. Após criar o usuário auth, execute:
UPDATE profiles 
SET role = 'admin', 
    subscription_status = 'active',
    name = 'Admin WBC'
WHERE email = 'admin@wbc.com';

-- 3. Verificar se o admin foi criado
SELECT id, email, name, role, subscription_status 
FROM profiles 
WHERE email = 'admin@wbc.com';

-- 4. Se quiser criar outro usuário para testes:
-- Crie usuário auth com email: user@wbc.com
-- Depois execute:
UPDATE profiles 
SET role = 'user', 
    subscription_status = 'trial',
    name = 'User Test'
WHERE email = 'user@wbc.com';

-- 5. Verificar status geral
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as active_count,
  COUNT(CASE WHEN subscription_status = 'trial' THEN 1 END) as trial_count
FROM profiles;