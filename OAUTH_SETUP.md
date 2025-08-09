# 🌐 Como Configurar o Login com Google e GitHub no IndiBox

Este guia vai te mostrar, passo a passo, como configurar autenticação OAuth com Google e GitHub no projeto **IndiBox** usando o NextAuth.js.

---

## 🔑 Configurando o Login com Google

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um novo projeto ou selecione um já existente.
3. Ative a **Google Identity API** (ou **Google+ API**, se estiver disponível).
4. Vá para **"APIs e serviços" > "Credenciais"** e clique em **"Criar credenciais" > "ID do cliente OAuth 2.0"**.
5. Preencha os campos obrigatórios:

   * **Origens JavaScript autorizadas**:
     `http://localhost:3000`
   * **URIs de redirecionamento autorizados**:
     `https://vcezoiieemdakdhtnebt.supabase.co/auth/v1/callback`
6. Após criar, copie o **Client ID** e o **Client Secret** gerados — você vai precisar deles no próximo passo.

---

## 🐙 Configurando o Login com GitHub

1. Vá até os [GitHub Developer Settings](https://github.com/settings/developers).
2. Clique em **"New OAuth App"**.
3. Preencha os campos da seguinte forma:

   * **Application name**: `IndiBox`
   * **Homepage URL**: `http://localhost:3000`
   * **Authorization callback URL**:
     `https://vcezoiieemdakdhtnebt.supabase.co/auth/v1/callback`
4. Clique em **"Register application"**.
5. Copie o **Client ID** e gere o **Client Secret**.

---

## ⚙️ Configurando as Variáveis de Ambiente

1. Copie o arquivo de exemplo para criar o arquivo de variáveis local:

   ```bash
   cp .env.example .env.local
   ```
2. Agora, edite o `.env.local` e preencha os dados obtidos anteriormente:

   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=uma_chave_aleatória_bem_segura
   GOOGLE_CLIENT_ID=seu_google_client_id
   GOOGLE_CLIENT_SECRET=seu_google_client_secret
   GITHUB_ID=seu_github_client_id
   GITHUB_SECRET=seu_github_client_secret
   ```
3. Se quiser gerar uma `NEXTAUTH_SECRET` segura, use o seguinte comando:

   ```bash
   openssl rand -base64 32
   ```

---

## 🚀 Testando o Login

1. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```
2. Acesse o app em:
   `http://localhost:3000`
3. Clique no botão **"Entrar"** (geralmente no topo da página).
4. Faça login com sua conta do **Google** ou **GitHub**.

---

## 🧠 Dicas Importantes

* ❌ Nunca envie o `.env.local` para o Git! (Adicione ao `.gitignore` se necessário).
* ✅ Em produção, use as **URLs reais do seu domínio** nas configurações dos provedores OAuth.
* ☁️ Configure as variáveis de ambiente também na plataforma onde for fazer o deploy (como Vercel, Netlify, etc.).
* ⚠️ Atenção: O **NextAuth.js não funciona com `output: "export"`** no Next.js, pois precisa de rotas de API dinâmicas. Se você precisa de exportação estática, considere usar uma alternativa como **Firebase Auth** ou **Auth0**.
* 📦 Para deploy, prefira plataformas que **suportam rotas de API**, como:

  * [Vercel](https://vercel.com/)
  * [Netlify Functions](https://www.netlify.com/products/functions/)
  * Ou um servidor próprio com **Node.js**