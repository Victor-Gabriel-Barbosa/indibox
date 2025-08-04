# 🎮 IndieBox

**IndieBox** é uma plataforma web inspirada no [itch.io](https://itch.io), dedicada exclusivamente a **jogos indie gratuitos**. Nosso objetivo é criar um espaço acessível onde desenvolvedores independentes possam compartilhar suas criações e jogadores descubram experiências únicas, criativas e **100% sem custo**.

**🌐 Acesse a plataforma:** [indibox.vercel.app](https://indibox.vercel.app/)

---

## 🌟 Visão Geral

* 🎯 **Foco**: Jogos indie gratuitos
* 🛠️ **Para quem desenvolve**: Um ambiente amigável para publicar, atualizar e divulgar seus projetos
* 🕹️ **Para quem joga**: Um catálogo curado de jogos independentes com foco na diversidade e originalidade
* 💬 **Comunidade**: Espaço para avaliações, comentários e apoio mútuo entre devs e jogadores

---

## 📷 Capturas de Tela

> *Interface moderna com tema claro/escuro, carrossel de jogos em destaque e design responsivo.*

---

## 🚀 Funcionalidades Implementadas

* ✅ **Interface moderna e responsiva** com Next.js 15 + Tailwind CSS 4
* ✅ **Sistema de temas** (claro, escuro, automático do sistema)
* ✅ **Autenticação OAuth** com Google e GitHub via NextAuth.js
* ✅ **Integração com Supabase** para banco de dados e autenticação
* ✅ **Carrossel interativo** de jogos em destaque (Swiper.js)
* ✅ **Design system** com componentes reutilizáveis
* ✅ **Navegação responsiva** com menu mobile
* ✅ **Modal de login/logout** integrado
* ✅ **Sincronização automática** de usuários com Supabase
* ✅ **TypeScript** para tipagem estática

### 🔄 Funcionalidades em Desenvolvimento

* 🔧 Sistema de upload e gerenciamento de jogos
* 🔧 Página de perfil para desenvolvedores
* 🔧 Sistema de busca e filtros
* 🔧 Avaliações e comentários da comunidade
* 🔧 Sistema de tags e categorias

---

## 🛠️ Stack Tecnológico

**Frontend:**

* ⚡ **Next.js 15** - Framework React com App Router
* 🎨 **Tailwind CSS 4** - Framework CSS utilitário
* 🔒 **NextAuth.js** - Autenticação OAuth (Google, GitHub)
* 🎠 **Swiper.js** - Carrosséis e sliders interativos
* 🎭 **React Icons** - Biblioteca de ícones

**Backend & Database:**

* 🐘 **Supabase** - Banco PostgreSQL + Auth + Real-time
* 🔐 **Row Level Security** - Políticas de segurança no banco

**DevTools:**

* 📘 **TypeScript** - Tipagem estática
* 🧹 **ESLint** - Linting e qualidade de código
* 📝 **Documentação** - Guias de configuração inclusos

**Deploy & Hospedagem:**

* ▲ **Vercel** - Hospedagem e deploy automático
* 🌐 **Domínio**: [indibox.vercel.app](https://indibox.vercel.app/)

---

## ⚙️ Configuração e Instalação

### 📋 Pré-requisitos

* Node.js 18+
* npm ou yarn
* Conta no [Supabase](https://supabase.com) (opcional, mas recomendado)
* Credenciais OAuth do Google e GitHub (opcional para autenticação)

### 🚀 Como rodar o projeto localmente

```bash
# Clone este repositório
git clone https://github.com/Victor-Gabriel-Barbosa/indibox.git

# Acesse a pasta do projeto
cd indibox

# Instale as dependências
npm install

# Configure as variáveis de ambiente (opcional)
cp .env.example .env.local
# Edite o arquivo .env.local com suas credenciais

# Inicie o servidor de desenvolvimento
npm run dev
```

O projeto rodará em `http://localhost:3000`

### 🔧 Configuração Opcional

Para funcionalidades completas, configure:

1. **Supabase**: Siga o guia em [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)
2. **OAuth**: Siga o guia em [`OAUTH_SETUP.md`](./OAUTH_SETUP.md)

> ⚠️ **Nota**: O projeto funciona mesmo sem essas configurações, mas com funcionalidades limitadas.

---

## 🏗️ Estrutura do Projeto

```text
src/
├── app/                    # App Router (Next.js 15)
│   ├── api/auth/          # Rotas de autenticação
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React reutilizáveis
│   ├── Header.tsx         # Cabeçalho com navegação
│   ├── Footer.tsx         # Rodapé
│   ├── LoginModal.tsx     # Modal de login/logout
│   └── Layout.tsx         # Layout wrapper
├── contexts/              # Contextos React
│   └── ThemeContext.tsx   # Gerenciamento de temas
├── hooks/                 # Hooks customizados
├── lib/                   # Utilities e configurações
│   ├── supabase.ts        # Cliente Supabase
│   ├── database.ts        # Operações de banco
│   └── uuid.ts            # Geração de IDs
└── types/                 # Definições TypeScript
    └── supabase.ts        # Tipos do banco Supabase
```

---

## 🌐 Deploy

O projeto está hospedado no **Vercel** com deploy automático:

* **URL de Produção**: [indibox.vercel.app](https://indibox.vercel.app/)
* **Deploy automático** a cada push na branch `main`
* **Preview deployments** para pull requests
* **Environment Variables** configuradas no painel do Vercel

### Como fazer deploy

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no painel do Vercel
3. O deploy será automático a cada push

---

## 🤝 Contribuições

Sinta-se à vontade para abrir **issues**, enviar **pull requests** ou sugerir ideias. A IndieBox é um projeto comunitário, feito para devs e por devs!

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

## 💡 Ideias Futuras

* 💾 Galeria de jogos para baixar direto do navegador
* 🌐 Sistema de tags e curadoria por temas
* 📈 Métricas para desenvolvedores acompanharem o desempenho de seus jogos
* 🧑‍🤝‍🧑 Rankings e recomendações personalizadas

---

## ✨ Entre em Contato

> Links de contato

* GitHub: [@Victor-Gabriel-Barbosa](https://github.com/Victor-Gabriel-Barbosa)
* GitHub: [@Guiscoob7](https://github.com/Guiscoob7)
* GitHub: [@Maria-Eduarda-FT](https://github.com/Maria-Eduarda-FT)
