<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class=" text-black"
    style="background-color: silver">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

            <!-- Logo ou ícone de imagem -->
    <q-avatar size="50px" class="q-mr-sm">
      <img src="wpsicone.png" alt="Logo" />
    </q-avatar>

        <q-toolbar-title class="row items-center">
          <!-- <q-icon name="support_agent" class="q-mr-sm" /> -->
        Analistas de suporte
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
          WPS-Per2park
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
            <q-item-label caption></q-item-label>
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
            <q-item-label caption></q-item-label>
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
            <q-item-label>Ranking top-10</q-item-label>
            <q-item-label caption>Unidades com mais chamados</q-item-label>
          </q-item-section>
        </q-item>

              <q-item
          clickable
          v-ripple
          to="/replicacao"
          exact
          v-if="authStore.isLoggedIn"
        >
          <q-item-section avatar>
            <q-icon name="computer" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Unidades Offline</q-item-label>
            <q-item-label caption>Falha replicação</q-item-label>
          </q-item-section>
        </q-item>

           <!-- <q-item
          clickable
          v-ripple
          to="/testeee"
          exact
          v-if="authStore.isLoggedIn"
        >
          <q-item-section avatar>
            <q-icon name="" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Espaço em disco</q-item-label>
            <q-item-label caption>Disco server e database</q-item-label>
          </q-item-section>
        </q-item> -->

        <q-separator class="q-my-md" />
     <q-item
          clickable
          v-ripple
          to="/testeee"
          exact
          v-if="authStore.isLoggedIn"
        >
          <q-item-section avatar>
            <q-icon name="computer" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Meus chamados</q-item-label>
            <q-item-label caption>Historico de chamados</q-item-label>
          </q-item-section>
        </q-item>

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
