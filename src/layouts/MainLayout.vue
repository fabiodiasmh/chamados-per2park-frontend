<template>
  <q-layout view="lHh Lpr lFf">
   <q-header class="bg-dark-page text-white q-px-md glass" style="border-bottom: 1px solid rgba(255,255,255,0.05)">
  <q-toolbar>
    <q-btn flat dense round icon="menu" @click="toggleLeftDrawer" />
    <q-avatar size="42px" class="q-mr-sm">
      <img src="wpsicone.png" alt="Logo" />
    </q-avatar>
    <!-- <q-toolbar-title class="text-weight-bold text-gradient">Analistas de Suporte</q-toolbar-title> -->
    <q-space />
    <div class="row items-center q-gutter-sm">
      <span v-if="authStore.userEmail" class="text-caption text-weight-medium text-grey-4">
        {{ authStore.userEmail }}
      </span>
      <q-btn
        flat
        round
        dense
        icon="logout"
        color="white"
        @click="logout"
        title="Sair"
      />
    </div>
  </q-toolbar>
</q-header>

<q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-dark-page text-grey-10"
      :width="260"
    >
      <q-scroll-area style="height: 100%">
        <div class="q-pa-md flex flex-center">
           <!-- Optional: Add a larger logo or user info here -->
        </div>

        <q-list padding class="q-gutter-y-sm">
          <!-- Itens do menu -->
          <q-item
            clickable
            v-ripple
            to="/dashboard"
            exact
            active-class="bg-gradient-primary text-white shadow-4"
            class="rounded-borders q-mx-sm"
          >
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Dashboard</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/chamados"
            exact
            active-class="bg-gradient-primary text-white shadow-4"
            class="rounded-borders q-mx-sm"
          >
            <q-item-section avatar>
              <q-icon name="assignment" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Chamados</q-item-label>
              <q-item-label caption class="text-grey-5">Gerenciar chamados</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/relatorios"
            exact
            active-class="bg-gradient-primary text-white shadow-4"
            class="rounded-borders q-mx-sm"
          >
            <q-item-section avatar>
              <q-icon name="bar_chart" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Ranking Top-10</q-item-label>
              <q-item-label caption class="text-grey-5">Unidades com mais chamados</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/replicacao"
            exact
            active-class="bg-gradient-primary text-white shadow-4"
            class="rounded-borders q-mx-sm"
          >
            <q-item-section avatar>
              <q-icon name="dns" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Unidades</q-item-label>
              <q-item-label caption class="text-grey-5">Servidor local</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator spaced class="bg-grey-8" />

          <q-item
            clickable
            v-ripple
            to="/meus-chamados"
            exact

            active-class="bg-gradient-primary text-white shadow-4"
            class="rounded-borders q-mx-sm"
          >
            <q-item-section avatar>
              <q-icon name="history" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Meus chamados</q-item-label>
              <q-item-label caption class="text-grey-5">Histórico de atendimentos</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
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
}

onMounted(() => {
  // Initialize auth state from localStorage
  authStore.initializeAuth()
})
</script>

<style scoped>
.q-item {
  transition: all 0.3s ease;
}

.q-item:hover:not(.q-item--active) {
  background-color: rgba(255, 255, 255, 0.05);
  transform: translateX(5px);
}
</style>
