# Sistema de Chamados Per2Park - Frontend Quasar.js

## Visão Geral

Este é o frontend do sistema de chamados Per2Park, desenvolvido com Quasar.js e Vue 3. O sistema permite gerenciar chamados, visualizar relatórios e análises baseadas nas APIs do backend Java Spring Boot.

## Funcionalidades Implementadas

### 🔐 Autenticação
- **Login seguro** com validação de formulário
- **Persistência de sessão** usando localStorage
- **Gerenciamento de estado** com Pinia
- **Proteção de rotas** baseada em autenticação

### 📊 Dashboard
- **Visão geral** com cards de estatísticas
- **Chamados recentes** com preview
- **Top 5 locais** com mais chamados
- **Ações rápidas** para navegação
- **Filtros por status** interativos

### 📋 Gestão de Chamados
- **Listagem completa** com tabela paginada
- **Filtros avançados** por status e busca textual
- **Visualização detalhada** de cada chamado
- **Ordenação** por diferentes campos
- **Interface responsiva** para mobile e desktop

### 📈 Relatórios e Análises
- **Gráfico de pizza** para distribuição por status
- **Gráfico de barras** para top locais
- **Cards de resumo** com estatísticas gerais
- **Tabela ranking** de locais com progress bars
- **Visualizações interativas** usando Canvas

### 🎨 Interface e UX
- **Design moderno** com Quasar Material Design
- **Navegação intuitiva** com drawer lateral
- **Responsividade** para todos os dispositivos
- **Feedback visual** com notificações e loading states
- **Cores consistentes** para diferentes status

## Estrutura do Projeto

```
src/
├── pages/
│   ├── LoginPage.vue          # Página de login
│   ├── DashboardPage.vue      # Dashboard principal
│   ├── ChamadosPage.vue       # Gestão de chamados
│   └── RelatoriosPage.vue     # Relatórios e gráficos
├── layouts/
│   └── MainLayout.vue         # Layout principal com navegação
├── stores/
│   ├── auth.js               # Store de autenticação
│   └── chamados.js           # Store de chamados
├── router/
│   └── routes.js             # Configuração de rotas
└── boot/
    └── axios.js              # Configuração do Axios
```

## APIs Integradas

O frontend consome as seguintes APIs do backend Java:

### 🔑 Autenticação
- `POST /api/login` - Autenticação do usuário

### 📋 Chamados
- `GET /api/chamados` - Listar todos os chamados
- `GET /api/chamadosPorStatus` - Estatísticas por status
- `GET /api/status?valor={id}` - Chamados por status específico
- `GET /api/locais` - Top 10 locais com mais chamados

## Configuração

### Pré-requisitos
- Node.js 16+
- npm ou yarn
- Backend Java Spring Boot rodando na porta 8085

### Instalação
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Configuração do Backend
O arquivo `src/boot/axios.js` está configurado para conectar com:
- **URL Base**: `http://localhost:8085/api/`
- **Credenciais**: `withCredentials: true` (para sessões)

## Tecnologias Utilizadas

- **Vue 3** - Framework JavaScript reativo
- **Quasar Framework** - UI framework baseado em Material Design
- **Pinia** - Gerenciamento de estado
- **Vue Router** - Roteamento SPA
- **Axios** - Cliente HTTP
- **Canvas API** - Gráficos customizados

## Recursos de UX/UI

### 🎨 Design System
- **Cores consistentes** para status de chamados:
  - 🟠 ABERTO: Orange
  - 🔵 EM_ANDAMENTO: Blue
  - 🟢 FECHADO: Green
  - 🔴 CANCELADO: Red

### 📱 Responsividade
- **Mobile-first** design
- **Breakpoints** otimizados para tablets e desktop
- **Navegação adaptativa** com drawer lateral

### ⚡ Performance
- **Lazy loading** de componentes
- **Paginação** para grandes listas
- **Debounce** em filtros de busca
- **Loading states** para melhor UX

## Funcionalidades Avançadas

### 🔍 Filtros Inteligentes
- **Busca textual** em título, descrição e local
- **Filtro por status** com botões interativos
- **Combinação de filtros** para resultados precisos

### 📊 Visualizações de Dados
- **Gráficos customizados** usando Canvas
- **Progress bars** para ranking de locais
- **Badges coloridos** para status
- **Cards informativos** com ícones

### 🔄 Gerenciamento de Estado
- **Persistência** de dados de autenticação
- **Cache** de dados de chamados
- **Sincronização** automática entre componentes

## Próximos Passos

### 🚀 Melhorias Futuras
- [ ] **Filtros por data** nos relatórios
- [ ] **Exportação** de dados para PDF/Excel
- [ ] **Notificações** em tempo real
- [ ] **Dashboard personalizável**
- [ ] **Modo escuro** (dark theme)
- [ ] **PWA** para uso offline

### 🔧 Otimizações Técnicas
- [ ] **Virtual scrolling** para listas grandes
- [ ] **Service Worker** para cache
- [ ] **Lazy loading** de imagens
- [ ] **Bundle splitting** otimizado

## Suporte

Para dúvidas ou sugestões sobre o sistema, consulte a documentação do Quasar Framework ou entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ usando Quasar Framework**
