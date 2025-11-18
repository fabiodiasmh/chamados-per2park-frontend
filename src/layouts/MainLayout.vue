<template>
  <q-layout view="lHh Lpr lFf">
   <q-header elevated class="bg-blue-grey-2 text-black q-px-md">
  <q-toolbar>
    <q-btn flat dense round icon="menu" @click="toggleLeftDrawer" />
    <q-avatar size="42px" class="q-mr-sm">
      <img src="wpsicone.png" alt="Logo" />
    </q-avatar>
    <q-toolbar-title>Analistas de Suporte</q-toolbar-title>
    <q-space />
    <div class="row items-center q-gutter-sm">
      <span v-if="authStore.userEmail" class="text-caption text-weight-medium">
        {{ authStore.userEmail }}
      </span>
      <q-btn

        flat
        round
        dense
        icon="logout"
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

      class="bg-grey-2 text-grey-9"
    >
      <q-scroll-area style="height: 100%">
        <q-list padding>
          <!-- Cabeçalho do usuário -->
          <div class="column items-center q-py-md">
            <!-- <q-avatar size="64px">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png" alt="User" />
            </q-avatar>
            <div class="text-weight-bold text-subtitle1 q-mt-sm">
              {{ authStore.usuario.User.Name || 'Analista' }}
            </div>
            <div class="text-caption text-grey-7">Analista Suporte</div> -->
          </div>

          <q-separator spaced />

          <!-- Itens do menu -->
          <q-item
            clickable
            v-ripple
            to="/dashboard"
            exact
            active-class="bg-blue-6 text-white"
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
            active-class="bg-blue-6 text-white"
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
            active-class="bg-blue-6 text-white"
          >
            <q-item-section avatar>
              <q-icon name="bar_chart" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Ranking Top-10</q-item-label>
              <q-item-label caption>Unidades com mais chamados</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/replicacao"
            exact
            active-class="bg-blue-6 text-white"
          >
            <q-item-section avatar>
              <q-icon name="dns" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Unidades</q-item-label>
              <q-item-label caption>Servidor local</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator spaced />

          <q-item
            clickable
            v-ripple
            to="/meus-chamados"
            exact
            disable
            active-class="bg-blue-6 text-white"
          >
            <q-item-section avatar>
              <q-icon name="history" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Meus chamados</q-item-label>
              <q-item-label caption>Histórico de atendimentos</q-item-label>
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
  // $q.notify({
  //   type: 'info',
  //   message: 'Logout realizado com sucesso',
  //   position: 'top'
  // })
}

onMounted(() => {
  // Initialize auth state from localStorage
  authStore.initializeAuth()
})
</script>

<style scoped>

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
  transition: background-color 0.2s;
}
</style>
