const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/login' },
      // { path: '', redirect: '/dashboard' },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'dashboard', component: () => import('pages/DashboardPage.vue') },
      { path: 'chamados', component: () => import('pages/ChamadosPage.vue') },
      { path: 'relatorios', component: () => import('pages/RelatoriosPage.vue') },
      { path: 'replicacao', component: () => import('pages/ReplicacaoPendente.vue') },
      { path: 'meus-chamados', component: () => import('pages/MeusChamados.vue') },
      { path: 'test', component: () => import('pages/TestPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
