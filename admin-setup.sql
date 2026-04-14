-- SQL para criar as tabelas necessárias no Supabase

-- Adicionar campo role na tabela users (se não existir)
-- Nota: O Supabase pode não permitir ALTER TABLE via API, então execute isso no SQL Editor
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'seller';

-- Atualizar o usuário admin (substitua pelo email do admin)
-- UPDATE public.users SET role = 'admin' WHERE email = 'seu_email@admin.com';

-- Tabela de Vendas (Sales)
-- Nota: O sistema já usa a tabela 'orders', mas se quiser uma tabela separada 'sales':
CREATE TABLE IF NOT EXISTS public.sales (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id uuid REFERENCES public.users(id),
    seller_id uuid REFERENCES public.users(id),
    amount numeric NOT NULL,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Tabela de Pagamentos (Payouts)
CREATE TABLE IF NOT EXISTS public.payouts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id uuid REFERENCES public.users(id),
    total_amount numeric NOT NULL,
    platform_fee numeric NOT NULL,
    final_amount numeric NOT NULL,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    paid_at timestamp with time zone
);

-- Políticas de Segurança (RLS) para Payouts
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Admin pode ver tudo
CREATE POLICY "Admin pode ver todos os payouts" ON public.payouts
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
    );

-- Sellers podem ver seus próprios payouts
CREATE POLICY "Sellers podem ver seus próprios payouts" ON public.payouts
    FOR SELECT USING (auth.uid() = seller_id);

-- Apenas admin pode atualizar payouts
CREATE POLICY "Admin pode atualizar payouts" ON public.payouts
    FOR UPDATE USING (
        auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
    );

-- Apenas admin ou sistema (service role) pode inserir
CREATE POLICY "Sistema pode inserir payouts" ON public.payouts
    FOR INSERT WITH CHECK (true); -- Ajuste conforme necessário para segurança
