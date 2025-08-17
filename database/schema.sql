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


-- ================================
-- CAMPOS DE STORAGE
-- ================================

-- Adicionar campos para armazenar caminhos dos arquivos no Supabase Storage
ALTER TABLE jogos 
ADD COLUMN arquivo_jogo_path TEXT, -- Caminho do arquivo do jogo no bucket 'jogos'
ADD COLUMN imagem_capa_path TEXT,  -- Caminho da imagem de capa no bucket 'imagens'
ADD COLUMN capturas_tela_paths TEXT[] DEFAULT '{}'; -- Caminhos das screenshots no bucket 'screenshots'

-- Comentários para documentação
COMMENT ON COLUMN jogos.arquivo_jogo_path IS 'Caminho do arquivo do jogo no Supabase Storage bucket "jogos"';
COMMENT ON COLUMN jogos.imagem_capa_path IS 'Caminho da imagem de capa no Supabase Storage bucket "imagens"';
COMMENT ON COLUMN jogos.capturas_tela_paths IS 'Array de caminhos das screenshots no Supabase Storage bucket "screenshots"';

-- ================================
-- POLÍTICAS DE STORAGE (RLS)
-- ================================

-- Política para bucket 'jogos' - permite upload apenas para desenvolvedores
INSERT INTO storage.buckets (id, name, public) VALUES ('jogos', 'jogos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('imagens', 'imagens', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('screenshots', 'screenshots', true);

-- Política para upload de arquivos de jogos
CREATE POLICY "Desenvolvedores podem fazer upload de jogos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'jogos' AND 
    auth.uid()::text = (storage.foldername(name))[1] AND
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND papel = 'desenvolvedor'
    )
  );

-- Política para visualização de arquivos de jogos
CREATE POLICY "Todos podem visualizar jogos públicos" ON storage.objects
  FOR SELECT USING (bucket_id = 'jogos');

-- Política para deletar arquivos de jogos (apenas o próprio desenvolvedor)
CREATE POLICY "Desenvolvedores podem deletar seus próprios jogos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'jogos' AND 
    auth.uid()::text = (storage.foldername(name))[1] AND
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND papel = 'desenvolvedor'
    )
  );

-- Política para upload de imagens de capa
CREATE POLICY "Desenvolvedores podem fazer upload de imagens de capa" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'imagens' AND 
    auth.uid()::text = (storage.foldername(name))[2] AND
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND papel = 'desenvolvedor'
    )
  );

-- Política para visualização de imagens
CREATE POLICY "Todos podem visualizar imagens" ON storage.objects
  FOR SELECT USING (bucket_id = 'imagens');

-- Política para deletar imagens (apenas o próprio desenvolvedor)
CREATE POLICY "Desenvolvedores podem deletar suas próprias imagens" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'imagens' AND 
    auth.uid()::text = (storage.foldername(name))[2] AND
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND papel = 'desenvolvedor'
    )
  );

-- Política para upload de screenshots
CREATE POLICY "Desenvolvedores podem fazer upload de screenshots" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'screenshots' AND 
    auth.uid()::text = (storage.foldername(name))[2] AND
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND papel = 'desenvolvedor'
    )
  );

-- Política para visualização de screenshots
CREATE POLICY "Todos podem visualizar screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'screenshots');

-- Política para deletar screenshots (apenas o próprio desenvolvedor)
CREATE POLICY "Desenvolvedores podem deletar suas próprias screenshots" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'screenshots' AND 
    auth.uid()::text = (storage.foldername(name))[2] AND
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND papel = 'desenvolvedor'
    )
  );

-- ================================
-- FUNÇÕES PARA GERENCIAMENTO DE STORAGE
-- ================================

-- Função para limpar arquivos órfãos (arquivos sem referência na tabela jogos)
CREATE OR REPLACE FUNCTION limpar_arquivos_orfaos()
RETURNS INTEGER AS $$
DECLARE
  arquivos_removidos INTEGER := 0;
  arquivo RECORD;
BEGIN
  -- Remove arquivos de jogos órfãos
  FOR arquivo IN 
    SELECT name FROM storage.objects 
    WHERE bucket_id = 'jogos' 
    AND name NOT IN (SELECT arquivo_jogo_path FROM jogos WHERE arquivo_jogo_path IS NOT NULL)
  LOOP
    DELETE FROM storage.objects WHERE bucket_id = 'jogos' AND name = arquivo.name;
    arquivos_removidos := arquivos_removidos + 1;
  END LOOP;
  
  -- Remove imagens de capa órfãs
  FOR arquivo IN 
    SELECT name FROM storage.objects 
    WHERE bucket_id = 'imagens' 
    AND name NOT IN (SELECT imagem_capa_path FROM jogos WHERE imagem_capa_path IS NOT NULL)
  LOOP
    DELETE FROM storage.objects WHERE bucket_id = 'imagens' AND name = arquivo.name;
    arquivos_removidos := arquivos_removidos + 1;
  END LOOP;
  
  -- Remove screenshots órfãs
  FOR arquivo IN 
    SELECT name FROM storage.objects 
    WHERE bucket_id = 'screenshots' 
    AND name NOT IN (
      SELECT UNNEST(capturas_tela_paths) FROM jogos 
      WHERE capturas_tela_paths IS NOT NULL AND array_length(capturas_tela_paths, 1) > 0
    )
  LOOP
    DELETE FROM storage.objects WHERE bucket_id = 'screenshots' AND name = arquivo.name;
    arquivos_removidos := arquivos_removidos + 1;
  END LOOP;
  
  RETURN arquivos_removidos;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função trigger para limpar arquivos quando um jogo é deletado
CREATE OR REPLACE FUNCTION limpar_arquivos_jogo_deletado()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove arquivo do jogo
  IF OLD.arquivo_jogo_path IS NOT NULL THEN
    DELETE FROM storage.objects 
    WHERE bucket_id = 'jogos' AND name = OLD.arquivo_jogo_path;
  END IF;
  
  -- Remove imagem de capa
  IF OLD.imagem_capa_path IS NOT NULL THEN
    DELETE FROM storage.objects 
    WHERE bucket_id = 'imagens' AND name = OLD.imagem_capa_path;
  END IF;
  
  -- Remove screenshots
  IF OLD.capturas_tela_paths IS NOT NULL AND array_length(OLD.capturas_tela_paths, 1) > 0 THEN
    DELETE FROM storage.objects 
    WHERE bucket_id = 'screenshots' AND name = ANY(OLD.capturas_tela_paths);
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar limpeza automática quando jogo é deletado
CREATE TRIGGER trigger_limpar_arquivos_jogo_deletado
  BEFORE DELETE ON jogos
  FOR EACH ROW
  EXECUTE FUNCTION limpar_arquivos_jogo_deletado();