# 🥗 Diet Training App

Uma aplicação web para gerenciar dietas e treinos de forma simples e intuitiva.

## 🚀 Funcionalidades

- ✅ Cadastro de usuários por telefone
- ✅ Criação de planos de dieta personalizados
- ✅ Visualização em dashboard
- ✅ Exportação de dieta em PDF
- ✅ Modo escuro/claro

## 🛠️ Stack Tecnológico

- **Frontend**: HTML5, CSS3, JavaScript (vanilla)
- **Backend**: Supabase (PostgreSQL)
- **Hospedagem**: Vercel
- **Utilitários**: Font Awesome, html2pdf

## 📋 Pré-requisitos

- Conta Supabase criada em [supabase.com](https://supabase.com)
- (Opcional) Git instalado para versionamento

## ⚙️ Setup Local

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/diet-training-app.git
cd diet-training-app
```

### 2. Configurar Supabase

1. Crie um projeto no [Supabase Console](https://app.supabase.com)
2. Execute o script em `supabase-setup.sql` na aba "SQL Editor"
3. Copie suas credenciais (Project URL e Anon Key)

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` e adicione suas credenciais:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 4. Abrir no navegador

```bash
# Opção 1: Abrir diretamente
open index.html

# Opção 2: Usar um servidor local (Python)
python -m http.server 8000

# Opção 3: Usar Live Server (VS Code)
# Extensão: Live Server do ritwickdey
```

## 🌐 Deploy no Vercel

### 1. Push no GitHub

```bash
git add .
git commit -m "Prepare for production"
git push origin main
```

### 2. Importar no Vercel

- Acesse [vercel.com](https://vercel.com/dashboard)
- Clique em "New Project"
- Selecione "Import Git Repository"
- Escolha `diet-training-app`

### 3. Configurar variáveis de ambiente

Na tela de configuração do Vercel, em "Environment Variables", adicione:

- `VITE_SUPABASE_URL` = sua URL do Supabase
- `VITE_SUPABASE_ANON_KEY` = sua chave anônima

### 4. Deploy

Clique em "Deploy" e pronto! 🎉

## 📱 Estrutura de Pastas

```
diet-training-app/
├── index.html              # Página inicial
├── register.html           # Registro de usuários
├── dashboard.html          # Dashboard pessoal
├── diet.html              # Criador de dieta
├── supabase-setup.sql     # Script de tabelas
├── css/                    # Estilos
│   ├── base.css
│   ├── home.css
│   ├── register.css
│   ├── dashboard.css
│   ├── diet.css
│   └── pdf.css
└── js/                     # Scripts
    ├── supabase-config.js  # Configuração
    ├── home.js
    ├── register.js
    ├── dashboard.js
    ├── diet.js
    ├── darkmode.js
    └── utils.js
```

## 🔒 Segurança

- As credenciais Supabase são carregadas via variáveis de ambiente
- Row Level Security (RLS) está habilitado no banco
- O arquivo `.env.local` é ignorado do Git

## 💡 Dicas

- Teste localmente antes de fazer push
- Verifique os limites gratuitos do Supabase
- Monitore o uso de API no Supabase Console

## 📄 Licença

MIT

## 👨‍💻 Autor

Seu Nome
