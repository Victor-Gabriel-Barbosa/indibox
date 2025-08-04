# Configuração do Supabase - IndiBox

Este guia mostra como configurar o Supabase como banco de dados para o projeto IndiBox.

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Projeto Next.js configurado
- Node.js e npm/yarn instalados

## 🚀 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Escolha sua organização
4. Defina um nome para o projeto (ex: `indibox-db`)
5. Defina uma senha segura para o banco
6. Escolha a região mais próxima do seu público
7. Clique em "Create new project"

### 2. Configurar Variáveis de Ambiente

1. No dashboard do Supabase, vá em **Settings > API**
2. Copie as seguintes informações:
   - **URL** (Project URL)
   - **anon key** (Project API keys > anon public)
   - **service_role key** (Project API keys > service_role)

3. Abra o arquivo `.env.local` na raiz do projeto e atualize:

```bash
# Configuração do Supabase
NEXT_PUBLIC_SUPABASE_URL=seu_supabase_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu_supabase_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=seu_supabase_service_role_key_aqui

# Database URL (opcional, para migrações)
DATABASE_URL=sua_connection_string_do_banco
```

### 3. Executar Script SQL

1. No dashboard do Supabase, vá em **SQL Editor**
2. Abra o arquivo `database/schema.sql` deste projeto
3. Copie todo o conteúdo
4. Cole no SQL Editor do Supabase
5. Clique em "Run" para executar

**Se tiver problemas com RLS (erro 42501):**
1. Execute também o arquivo `database/dev-policies.sql`
2. Esse arquivo contém políticas mais permissivas para desenvolvimento

### 4. Testar a Configuração

1. Acesse `http://localhost:3000/test-supabase`
2. Execute os testes em ordem:
   - Teste de Conexão
   - Teste de Tabelas  
   - Teste de Usuário

**Códigos de erro comuns:**
- `22P02` - UUID inválido (agora corrigido)
- `42501` - Bloqueado por política RLS (execute dev-policies.sql)
- `23505` - Usuário já existe (normal, será atualizado)
- `42P01` - Tabela não encontrada (execute schema.sql)

Isso irá criar:
- ✅ Tabelas (`users`, `games`, `reviews`, `favorites`)
- ✅ Índices para performance
- ✅ Funções e triggers
- ✅ Políticas RLS (Row Level Security)
- ✅ Dados de exemplo

### 4. Configurar RLS (Row Level Security)

O script SQL já configura as políticas de segurança, mas você pode personalizá-las:

1. Vá em **Authentication > Policies**
2. Revise as políticas criadas
3. Modifique conforme necessário

### 5. Configurar Storage (Opcional)

Para upload de imagens dos jogos:

1. Vá em **Storage**
2. Clique em "New bucket"
3. Nome: `game-assets`
4. Defina como público: `true`
5. Configure políticas de upload

## 🔧 Uso no Código

### Cliente Supabase

```typescript
import { supabase } from '@/lib/supabase';

// Exemplo: buscar jogos
const { data, error } = await supabase
  .from('games')
  .select('*')
  .eq('status', 'published');
```

### Hooks Personalizados

```typescript
import { useGames, useFeaturedGames } from '@/hooks/useSupabase';

function GamesList() {
  const { games, loading, error } = useGames();
  
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  
  return (
    <div>
      {games.map(game => (
        <div key={game.id}>{game.title}</div>
      ))}
    </div>
  );
}
```

### Operações CRUD

```typescript
import { 
  createGame, 
  updateGame, 
  addToFavorites,
  createReview 
} from '@/lib/database';

// Criar jogo
const newGame = await createGame({
  title: 'Meu Jogo',
  developer: 'Meu Studio',
  // ... outros campos
});

// Adicionar aos favoritos
await addToFavorites(userId, gameId);

// Criar avaliação
await createReview({
  game_id: gameId,
  user_id: userId,
  rating: 5,
  comment: 'Jogo incrível!'
});
```

## 🔒 Autenticação

O projeto já está configurado para sincronizar usuários do NextAuth com o Supabase automaticamente. Quando um usuário faz login via Google ou GitHub, os dados são salvos na tabela `users`.

## 📊 Estrutura do Banco

### Tabelas Principais

- **users**: Perfis dos usuários
- **games**: Jogos cadastrados
- **reviews**: Avaliações dos jogos
- **favorites**: Jogos favoritos dos usuários

### Campos Importantes

**Games**:
- `title`, `description`, `developer`
- `genre[]`, `tags[]`, `platform[]`
- `status` (draft/published/archived)
- `featured` (destaque na homepage)
- `download_count`, `rating`

**Users**:
- `role` (user/developer/admin)
- `github_username`, `twitter_username`
- `bio`, `website`

## 🧪 Testando a Conexão

Execute no terminal:

```bash
npm run dev
```

Verifique o console do navegador para mensagens de conexão com o Supabase.

## 📈 Próximos Passos

1. **Analytics**: Configure o Supabase Analytics
2. **Realtime**: Implemente atualizações em tempo real
3. **Storage**: Configure upload de imagens
4. **Edge Functions**: Para lógica server-side avançada
5. **Backups**: Configure backups automáticos

## 🆘 Solução de Problemas

### Erro de Conexão
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo
- Verifique a rede/firewall

### Erro de Permissão
- Revise as políticas RLS
- Verifique se o usuário está autenticado
- Confirme os roles e permissões

### Performance Lenta
- Verifique se os índices foram criados
- Analise as queries no Supabase Dashboard
- Consider pagination para listas grandes

## 📚 Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Guia Next.js + Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Políticas RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Reference](https://supabase.com/docs/reference/sql)
