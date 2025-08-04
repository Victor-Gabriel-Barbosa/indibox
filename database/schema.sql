-- ================================
-- SCRIPT SQL PARA SUPABASE
-- ================================

-- Criação dos ENUMs
CREATE TYPE user_role AS ENUM ('user', 'developer', 'admin');
CREATE TYPE game_status AS ENUM ('published', 'draft', 'archived');

-- ================================
-- TABELA DE USUÁRIOS
-- ================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    github_username VARCHAR(255),
    twitter_username VARCHAR(255),
    role user_role DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- TABELA DE JOGOS
-- ================================
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    short_description TEXT,
    developer VARCHAR(255) NOT NULL,
    release_date DATE,
    genre TEXT[] NOT NULL DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    download_url TEXT,
    website_url TEXT,
    github_url TEXT,
    cover_image TEXT,
    screenshots TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    file_size VARCHAR(50),
    platform TEXT[] NOT NULL DEFAULT '{}',
    status game_status DEFAULT 'draft',
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_games_updated_at 
    BEFORE UPDATE ON games 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_featured ON games(featured);
CREATE INDEX idx_games_genre ON games USING GIN(genre);
CREATE INDEX idx_games_tags ON games USING GIN(tags);
CREATE INDEX idx_games_platform ON games USING GIN(platform);
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_games_created_at ON games(created_at DESC);
CREATE INDEX idx_games_download_count ON games(download_count DESC);
CREATE INDEX idx_games_rating ON games(rating DESC);

-- ================================
-- TABELA DE AVALIAÇÕES
-- ================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(game_id, user_id) -- Um usuário só pode avaliar um jogo uma vez
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX idx_reviews_game_id ON reviews(game_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- ================================
-- TABELA DE FAVORITOS
-- ================================
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, game_id) -- Um usuário só pode favoritar um jogo uma vez
);

-- Índices
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_game_id ON favorites(game_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- ================================
-- FUNÇÕES E PROCEDURES
-- ================================

-- Função para incrementar contador de downloads
CREATE OR REPLACE FUNCTION increment_download_count(game_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE games 
    SET download_count = download_count + 1,
        updated_at = NOW()
    WHERE id = game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para calcular rating médio dos jogos
CREATE OR REPLACE FUNCTION calculate_game_rating(game_id UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    avg_rating DECIMAL(3,2);
BEGIN
    SELECT ROUND(AVG(rating)::numeric, 2) INTO avg_rating
    FROM reviews 
    WHERE reviews.game_id = calculate_game_rating.game_id;
    
    IF avg_rating IS NULL THEN
        avg_rating := 0;
    END IF;
    
    UPDATE games 
    SET rating = avg_rating,
        updated_at = NOW()
    WHERE id = calculate_game_rating.game_id;
    
    RETURN avg_rating;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para recalcular rating quando uma review é inserida/atualizada/deletada
CREATE OR REPLACE FUNCTION update_game_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM calculate_game_rating(OLD.game_id);
        RETURN OLD;
    ELSE
        PERFORM calculate_game_rating(NEW.game_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_game_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_game_rating();

-- ================================
-- POLÍTICAS RLS (Row Level Security)
-- ================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Políticas para USERS
CREATE POLICY "Usuários podem ver perfis públicos" ON users
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para GAMES
CREATE POLICY "Todos podem ver jogos publicados" ON games
    FOR SELECT USING (status = 'published' OR auth.uid() = user_id);

CREATE POLICY "Desenvolvedores podem inserir jogos" ON games
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Desenvolvedores podem atualizar seus jogos" ON games
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Desenvolvedores podem deletar seus jogos" ON games
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para REVIEWS
CREATE POLICY "Todos podem ver reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias reviews" ON reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para FAVORITES
CREATE POLICY "Usuários podem ver seus próprios favoritos" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir favoritos" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus favoritos" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- ================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ================================

-- Inserir usuário de exemplo (substitua pelos dados reais)
INSERT INTO users (id, email, name, role) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'admin@indibox.com', 'Admin', 'admin');

-- Inserir jogos de exemplo
INSERT INTO games (
    title, 
    description, 
    short_description,
    developer, 
    genre, 
    platform, 
    status, 
    featured,
    user_id,
    cover_image
) VALUES 
    (
        'Aventura Espacial',
        'Um jogo de aventura espacial emocionante com gráficos retrô.',
        'Aventura espacial retrô',
        'Indie Dev Studio',
        ARRAY['Aventura', 'Ação'],
        ARRAY['Windows', 'Linux'],
        'published',
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
        'published',
        false,
        '00000000-0000-0000-0000-000000000001',
        'https://via.placeholder.com/400x300'
    );

-- Comentários finais
-- Execute este script no editor SQL do Supabase
-- Certifique-se de que a extensão 'uuid-ossp' está habilitada
-- Para testar as funções, você pode usar:
-- SELECT increment_download_count('id-do-jogo-aqui');
-- SELECT calculate_game_rating('id-do-jogo-aqui');
