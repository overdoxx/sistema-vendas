# 🚀 Sistema de Gestão de Vendas - PREMIUM

Sistema **100% Node.js** com design moderno, modo escuro e análises avançadas.
**Otimizado para deploy no Vercel!**

## ✨ Novidades da Versão Premium

### 🎨 **Design Moderno**
- ✅ **Modo escuro completo** com gradientes
- ✅ **Responsividade total** - funciona perfeitamente no mobile
- ✅ **Menu lateral (sidebar)** para dispositivos móveis com animação de deslocamento
- ✅ **Overlay de fundo** para o menu mobile
- ✅ **Animações e transições** suaves
- ✅ **Cards com hover effects** e sombras

### 📊 **Análises Avançadas**
- ✅ **Crescimento mensal** vs mês anterior
- ✅ **Progresso da meta** com barra visual
- ✅ **Ticket médio** das vendas
- ✅ **Evolução mensal** (6 meses)
- ✅ **Múltiplos gráficos** profissionais

### 🔧 **Funcionalidades Melhoradas**
- ✅ **Vendas de datas passadas** - não só do dia atual
- ✅ **Campo de descrição** nas vendas
- ✅ **Filtros avançados** por período de data
- ✅ **Resumo das vendas** no histórico
- ✅ **Navegação mobile** completa
- ✅ **Excluir Vendas** - opção para remover vendas inseridas
- ✅ **Editar Vendas** - opção para editar vendas existentes
- ✅ **Venda Diária Total** - insira o valor final do dia

## 📋 Tecnologias

- **Backend**: Node.js + Express (Serverless Functions)
- **Views**: EJS
- **Styling**: Tailwind CSS (CDN) + Dark Mode
- **Database**: MongoDB Atlas
- **Authentication**: bcrypt + express-session
- **Charts**: Chart.js
- **Deploy**: Vercel (Zero-Config)

## ⚡ Instalação Local

\`\`\`bash
# 1. Clonar o repositório
git clone <seu-repo>
cd sales-management-system

# 2. Instalar dependências
npm install

# 3. Configurar .env
# Copie o .env.example e configure suas variáveis

# 4. Executar em desenvolvimento
npm run dev
\`\`\`

## 🌐 Deploy no Vercel

### Pré-requisitos
1. **MongoDB Atlas**: Configure seu banco de dados em [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Conta Vercel**: Crie uma conta em [vercel.com](https://vercel.com)

### Passos para Deploy
1. **Push para Git**: Envie seu código para GitHub/GitLab/Bitbucket
2. **Conectar no Vercel**: Importe seu repositório no Vercel
3. **Configurar Variáveis de Ambiente**:
   - \`MONGO_URI\`: String de conexão do MongoDB Atlas
   - \`SESSION_SECRET\`: Chave secreta para sessões
   - \`NODE_ENV\`: \`production\`
4. **Deploy Automático**: O Vercel fará o deploy automaticamente

### Estrutura Otimizada para Vercel
\`\`\`
├── api/
│   └── index.js           # Serverless Function principal
├── routes/                # Rotas organizadas
├── services/              # Lógica de negócio
├── models/                # Modelos MongoDB
├── middleware/            # Middlewares
├── views/                 # Templates EJS
├── vercel.json           # Configuração Vercel
├── dev-server.js         # Servidor para desenvolvimento
└── package.json
\`\`\`

## 🎯 Funcionalidades

### 🔐 **Autenticação**
- ✅ Login/Registro com design moderno
- ✅ Sessões seguras com MongoDB
- ✅ Hash de senhas com bcrypt

### 📊 **Dashboard Avançado**
- ✅ **4 cards de métricas** com gradientes
- ✅ **3 cards de análises** (crescimento, ticket médio, comissão)
- ✅ **2 gráficos profissionais**

### 📝 **Vendas Melhoradas**
- ✅ **Data personalizada** - vendas de qualquer dia
- ✅ **Campo descrição** opcional
- ✅ **Tipo de venda**: Individual ou Diária Total
- ✅ **Validação completa**

### 📈 **Histórico Premium**
- ✅ **Filtros avançados** por período
- ✅ **Resumo das vendas**
- ✅ **Tabela responsiva** desktop
- ✅ **Cards elegantes** mobile
- ✅ **Ações de Editar e Excluir**

### 📱 **Mobile First**
- ✅ **Menu lateral** funcional
- ✅ **Navegação completa** no mobile
- ✅ **Cards responsivos**
- ✅ **Gráficos adaptáveis**

## 🚀 **Pronto para produção no Vercel!** 

Sistema completo, moderno e otimizado para Serverless! 🎉

### URLs de Exemplo
- **Desenvolvimento**: http://localhost:3000
- **Produção**: https://seu-projeto.vercel.app
