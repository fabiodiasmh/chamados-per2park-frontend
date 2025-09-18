<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="row items-center">
          <!-- <q-icon name="support_agent" class="q-mr-sm" /> -->
          Per2Park - Suporte
        </q-toolbar-title>

        <div class="row items-center q-gutter-sm">
          <span v-if="authStore.userEmail" class="text-caption">
            {{ authStore.userEmail }}
          </span>
          <q-btn
            v-if="authStore.isLoggedIn"
            flat
            round
            icon="logout"
            @click="logout"
            title="Logout"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-1"
    >
      <q-list>
        <q-item-label header class="text-grey-8">
          Navegação
        </q-item-label>

        <q-item
          clickable
          v-ripple
          to="/dashboard"
          exact
          v-if="authStore.isLoggedIn"
        >
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboard</q-item-label>
            <q-item-label caption>Visão geral</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/chamados"
          exact
          v-if="authStore.isLoggedIn"
        >
          <q-item-section avatar>
            <q-icon name="assignment" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Chamados</q-item-label>
            <q-item-label caption>Gerenciar chamados</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/relatorios"
          exact
          v-if="authStore.isLoggedIn"
        >
          <q-item-section avatar>
            <q-icon name="analytics" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Relatórios</q-item-label>
            <q-item-label caption>Análises e gráficos</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item
          clickable
          v-ripple
          to="/login"
          exact
          v-if="!authStore.isLoggedIn"
        >
          <q-item-section avatar>
            <q-icon name="login" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Login</q-item-label>
            <q-item-label caption>Fazer login</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'

defineOptions({
  name: 'MainLayout'
})

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

const leftDrawerOpen = ref(false)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
  $q.notify({
    type: 'info',
    message: 'Logout realizado com sucesso',
    position: 'top'
  })
}

onMounted(() => {
  // Initialize auth state from localStorage
  authStore.initializeAuth()
})
</script>
