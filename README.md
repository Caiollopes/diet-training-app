# 🏋️ Diet Training App

Aplicativo web moderno para gerenciamento de treinos e dietas com design responsivo e modo escuro.

## ✨ Funcionalidades

### 🔐 Autenticação

- Sistema de login/registro integrado com Supabase Auth
- Armazenamento seguro de dados por usuário

### 💪 Treinos

- Criar e gerenciar múltiplos planos de treino
- Adicionar exercícios com séries e repetições
- Dashboard para visualizar todos os treinos
- Calendário para marcar dias de treino
- Exportar treinos em PDF

### 🍎 Dietas (NOVO!)

- Criar e gerenciar planos alimentares
- Adicionar refeições com horários
- Descrição detalhada de alimentos de cada refeição
- Dashboard para visualizar todas as dietas
- Interface moderna e intuitiva

### 🎨 Interface

- Design moderno com gradientes e animações
- Modo escuro/claro
- Totalmente responsivo (Desktop, Tablet, Mobile)
- Cards interativos com hover effects
- Indicadores de progresso

## 🚀 Como Usar

### 1. Configurar Supabase

1. Acesse [Supabase](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá em **SQL Editor** e execute o script em `supabase-setup.sql`
4. Copie suas credenciais em **Settings > API**
5. Atualize as credenciais em `js/supabase-config.js`

### 2. Estrutura do Banco de Dados

O sistema agora possui duas estruturas:

#### Sistema Antigo (baseado em telefone)

- `users` - Usuários com telefone
- `diets_old` - Dietas antigas (deprecated)
- `workouts` - Treinos

#### Sistema Novo (baseado em autenticação)

- `diets` - Planos alimentares
- `diet_meals` - Refeições de cada dieta

### 3. Executar o Projeto

```bash
# Serve com qualquer servidor HTTP simples
# Exemplo com Python:
python -m http.server 8000

# Ou com Node.js:
npx http-server

# Ou com Live Server do VS Code
```

## 📁 Estrutura de Arquivos

```
diet-training-app/
├── index.html              # Landing page
├── login.html              # Página de login
├── register.html           # Página de registro
├── user-home.html          # Dashboard principal
├── workout-dashboard.html  # Dashboard de treinos
├── workout.html            # Criar/editar treino
├── diet-dashboard.html     # Dashboard de dietas (NOVO!)
├── diet.html               # Criar/editar dieta (NOVO!)
├── supabase-setup.sql      # Script SQL para criar tabelas
├── css/
│   ├── base.css           # Estilos base
│   ├── user-home.css      # Dashboard principal
│   ├── workout.css        # Treinos
│   └── diet.css           # Dietas (NOVO!)
└── js/
    ├── darkmode.js
    ├── user-home.js
    ├── workout-dashboard.js
    ├── workout.js
    ├── diet-dashboard.js  # NOVO!
    ├── diet.js            # NOVO!
    └── supabase-config.js
```

## 🆕 O que há de novo?

### Sistema de Dietas Completo

1. **Dashboard de Dietas** - Lista e visualização de dietas
2. **Criação/Edição** - Processo em 2 etapas com indicador de progresso
3. **Refeições** - Adicionar múltiplas refeições com horários e alimentos
4. **Estatísticas** - Contador de dietas no dashboard principal

## 🛠️ Stack Tecnológico

- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Ícones**: Font Awesome 6.4.0
- **Exportação**: html2pdf.js

## 📝 Licença

MIT License
