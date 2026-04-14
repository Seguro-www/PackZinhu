-- SQL para corrigir a política de segurança da tabela payouts

-- Remover a política insegura anterior (se existir)
DROP POLICY IF EXISTS "Sistema pode inserir payouts" ON public.payouts;

-- Criar a política segura: apenas o service_role pode inserir
CREATE POLICY "Sistema pode inserir payouts" ON public.payouts
    FOR INSERT 
    WITH CHECK (auth.role() = 'service_role');
