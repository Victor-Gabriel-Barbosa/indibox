-- ================================
-- POLÍTICAS RLS SIMPLIFICADAS PARA DESENVOLVIMENTO
-- ================================
-- Execute este script se estiver tendo problemas com RLS durante desenvolvimento

-- Temporariamente desabilitar RLS para testes (CUIDADO: apenas para desenvolvimento!)
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE games DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;

-- OU manter RLS habilitado mas com políticas mais permissivas:

-- Remover políticas existentes se necessário
DROP POLICY IF EXISTS "Usuários podem ver perfis públicos" ON users;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON users;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios dados" ON users;

-- Políticas mais permissivas para desenvolvimento
CREATE POLICY "Permitir leitura de todos os usuários" ON users
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de usuários" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de usuários" ON users
    FOR UPDATE USING (true);

-- Política específica para service role (contorna todas as restrições)
CREATE POLICY "Service role bypass" ON users
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- Verificar políticas ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- Para reverter para políticas de produção, execute:
-- DROP POLICY IF EXISTS "Permitir leitura de todos os usuários" ON users;
-- DROP POLICY IF EXISTS "Permitir inserção de usuários" ON users;
-- DROP POLICY IF EXISTS "Permitir atualização de usuários" ON users;
-- DROP POLICY IF EXISTS "Service role bypass" ON users;

-- E recriar as políticas originais do schema.sql
