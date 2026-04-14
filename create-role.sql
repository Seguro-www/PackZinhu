-- Script para criar a coluna role e definir o admin

-- 1. Adiciona a coluna 'role' na tabela users (se ela ainda não existir)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'seller';

-- 2. Define os emails de admin
UPDATE public.users 
SET role = 'admin' 
WHERE email IN ('dweminem@gmail.com', 'contato.packzinhu@gmail.com');

-- 3. Confirmação
SELECT id, email, role FROM public.users WHERE role = 'admin';
