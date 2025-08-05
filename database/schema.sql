-- ================================
-- SCRIPT SQL PARA SUPABASE
-- ================================

-- Criação dos ENUMs
CREATE TYPE papel_usuario AS ENUM ('usuario', 'desenvolvedor', 'admin');
CREATE TYPE status_jogo AS ENUM ('publicado', 'rascunho', 'arquivado');

-- ================================
-- TABELA DE USUÁRIOS
-- ================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255),
    url_avatar TEXT,
    biografia TEXT,
    site TEXT,
    nome_usuario_github VARCHAR(255),
    nome_usuario_twitter VARCHAR(255),
    papel papel_usuario DEFAULT 'usuario',
    email_verificado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_atualizado_em 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_atualizado_em();

-- ================================
-- TABELA DE JOGOS
-- ================================
CREATE TABLE jogos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    descricao_curta TEXT,
    desenvolvedor VARCHAR(255) NOT NULL,
    data_lancamento DATE,
    genero TEXT[] NOT NULL DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    url_download TEXT,
    url_site TEXT,
    url_github TEXT,
    imagem_capa TEXT,
    capturas_tela TEXT[] DEFAULT '{}',
    avaliacao DECIMAL(3,2) DEFAULT 0,
    contador_download INTEGER DEFAULT 0,
    tamanho_arquivo VARCHAR(50),
    plataforma TEXT[] NOT NULL DEFAULT '{}',
    status status_jogo DEFAULT 'rascunho',
    destaque BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW(),
    id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Trigger para atualizar atualizado_em
CREATE TRIGGER update_jogos_atualizado_em 
    BEFORE UPDATE ON jogos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_atualizado_em();

-- Índices para melhor performance
CREATE INDEX idx_jogos_status ON jogos(status);
CREATE INDEX idx_jogos_destaque ON jogos(destaque);
CREATE INDEX idx_jogos_genero ON jogos USING GIN(genero);
CREATE INDEX idx_jogos_tags ON jogos USING GIN(tags);
CREATE INDEX idx_jogos_plataforma ON jogos USING GIN(plataforma);
CREATE INDEX idx_jogos_id_usuario ON jogos(id_usuario);
CREATE INDEX idx_jogos_criado_em ON jogos(criado_em DESC);
CREATE INDEX idx_jogos_contador_download ON jogos(contador_download DESC);
CREATE INDEX idx_jogos_avaliacao ON jogos(avaliacao DESC);

-- ================================
-- TABELA DE AVALIAÇÕES
-- ================================
CREATE TABLE avaliacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_jogo UUID NOT NULL REFERENCES jogos(id) ON DELETE CASCADE,
    id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    avaliacao INTEGER NOT NULL CHECK (avaliacao >= 1 AND avaliacao <= 5),
    comentario TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(id_jogo, id_usuario) -- Um usuário só pode avaliar um jogo uma vez
);

-- Trigger para atualizar atualizado_em
CREATE TRIGGER update_avaliacoes_atualizado_em 
    BEFORE UPDATE ON avaliacoes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_atualizado_em();

-- Índices
CREATE INDEX idx_avaliacoes_id_jogo ON avaliacoes(id_jogo);
CREATE INDEX idx_avaliacoes_id_usuario ON avaliacoes(id_usuario);
CREATE INDEX idx_avaliacoes_criado_em ON avaliacoes(criado_em DESC);

-- ================================
-- TABELA DE FAVORITOS
-- ================================
CREATE TABLE favoritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    id_jogo UUID NOT NULL REFERENCES jogos(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(id_usuario, id_jogo) -- Um usuário só pode favoritar um jogo uma vez
);

-- Índices
CREATE INDEX idx_favoritos_id_usuario ON favoritos(id_usuario);
CREATE INDEX idx_favoritos_id_jogo ON favoritos(id_jogo);
CREATE INDEX idx_favoritos_criado_em ON favoritos(criado_em DESC);

-- ================================
-- FUNÇÕES E PROCEDURES
-- ================================

-- Função para incrementar contador de downloads
CREATE OR REPLACE FUNCTION incrementar_contador_download(id_jogo UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE jogos 
    SET contador_download = contador_download + 1,
        atualizado_em = NOW()
    WHERE id = id_jogo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para calcular avaliacao médio dos jogos
CREATE OR REPLACE FUNCTION calcular_avaliacao_jogo(id_jogo UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    avaliacao_media DECIMAL(3,2);
BEGIN
    SELECT ROUND(AVG(avaliacao)::numeric, 2) INTO avaliacao_media
    FROM avaliacoes 
    WHERE avaliacoes.id_jogo = calcular_avaliacao_jogo.id_jogo;
    
    IF avaliacao_media IS NULL THEN
        avaliacao_media := 0;
    END IF;
    
    UPDATE jogos 
    SET avaliacao = avaliacao_media,
        atualizado_em = NOW()
    WHERE id = calcular_avaliacao_jogo.id_jogo;
    
    RETURN avaliacao_media;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para recalcular avaliacao quando uma avaliacao é inserida/atualizada/deletada
CREATE OR REPLACE FUNCTION atualizar_avaliacao_jogo()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM calcular_avaliacao_jogo(OLD.id_jogo);
        RETURN OLD;
    ELSE
        PERFORM calcular_avaliacao_jogo(NEW.id_jogo);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_avaliacao_jogo
    AFTER INSERT OR UPDATE OR DELETE ON avaliacoes
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_avaliacao_jogo();

-- ================================
-- POLÍTICAS RLS (Row Level Security)
-- ================================

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE jogos ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

-- Políticas para USUARIOS
CREATE POLICY "Usuários podem ver perfis públicos" ON usuarios
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON usuarios
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para JOGOS
CREATE POLICY "Todos podem ver jogos publicados" ON jogos
    FOR SELECT USING (status = 'publicado' OR auth.uid() = id_usuario);

CREATE POLICY "Desenvolvedores podem inserir jogos" ON jogos
    FOR INSERT WITH CHECK (auth.uid() = id_usuario);

CREATE POLICY "Desenvolvedores podem atualizar seus jogos" ON jogos
    FOR UPDATE USING (auth.uid() = id_usuario);

CREATE POLICY "Desenvolvedores podem deletar seus jogos" ON jogos
    FOR DELETE USING (auth.uid() = id_usuario);

-- Políticas para AVALIACOES
CREATE POLICY "Todos podem ver avaliacoes" ON avaliacoes
    FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir avaliacoes" ON avaliacoes
    FOR INSERT WITH CHECK (auth.uid() = id_usuario);

CREATE POLICY "Usuários podem atualizar suas próprias avaliacoes" ON avaliacoes
    FOR UPDATE USING (auth.uid() = id_usuario);

CREATE POLICY "Usuários podem deletar suas próprias avaliacoes" ON avaliacoes
    FOR DELETE USING (auth.uid() = id_usuario);

-- Políticas para FAVORITOS
CREATE POLICY "Usuários podem ver seus próprios favoritos" ON favoritos
    FOR SELECT USING (auth.uid() = id_usuario);

CREATE POLICY "Usuários podem inserir favoritos" ON favoritos
    FOR INSERT WITH CHECK (auth.uid() = id_usuario);

CREATE POLICY "Usuários podem deletar seus favoritos" ON favoritos
    FOR DELETE USING (auth.uid() = id_usuario);

-- ================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ================================

-- Inserir usuário de exemplo (substitua pelos dados reais)
INSERT INTO usuarios (id, email, nome, papel) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'admin@indibox.com', 'Admin', 'admin');

-- Inserir jogos de exemplo
INSERT INTO jogos (
    titulo, 
    descricao, 
    descricao_curta,
    desenvolvedor, 
    genero, 
    plataforma, 
    status, 
    destaque,
    id_usuario,
    imagem_capa
) VALUES 
    (
        'Aventura Espacial',
        'Um jogo de aventura espacial emocionante com gráficos retrô.',
        'Aventura espacial retrô',
        'Indie Dev Studio',
        ARRAY['Aventura', 'Ação'],
        ARRAY['Windows', 'Linux'],
        'publicado',
        true,
        '00000000-0000-0000-0000-000000000001',
        'https://via.placeholder.com/400x300'
    ),
    (
        'Puzzle Master',
        'Desafie sua mente com quebra-cabeças únicos e criativos.',
        'Quebra-cabeças desafiadores',
        'Brain Games Co',
        ARRAY['Puzzle', 'Casual'],
        ARRAY['Windows', 'Mac', 'Linux'],
        'publicado',
        false,
        '00000000-0000-0000-0000-000000000001',
        'https://via.placeholder.com/400x300'
    );

-- Comentários finais
-- Execute este script no editor SQL do Supabase
-- Certifique-se de que a extensão 'uuid-ossp' está habilitada
-- Para testar as funções, você pode usar:
-- SELECT incrementar_contador_download('id-do-jogo-aqui');
-- SELECT calcular_avaliacao_jogo('id-do-jogo-aqui');
