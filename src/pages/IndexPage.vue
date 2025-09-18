<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="column items-center q-gutter-md" style="max-width: 500px; width: 100%;">
      <img
        alt="Quasar logo"
        src="~assets/quasar-logo-vertical.svg"
        style="width: 200px; height: 200px"
      >

      <div class="text-h4 text-center text-primary">Per2Park</div>
      <div class="text-h6 text-center text-grey-7">Sistema de Chamados</div>

      <q-card class="q-pa-md" style="width: 100%;">
        <q-card-section>
          <div class="text-h6 text-center q-mb-md">Bem-vindo ao Sistema</div>
          <div class="text-body2 text-center q-mb-lg">
            Faça login para acessar o dashboard e gerenciar os chamados.
          </div>

          <div class="row justify-center q-gutter-md">
            <q-btn
              color="primary"
              label="Fazer Login"
              size="lg"
              @click="goToLogin"
              icon="login"
            />
            <q-btn
              color="secondary"
              label="Teste API"
              size="lg"
              @click="goToTest"
              icon="api"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineOptions({
  name: 'IndexPage'
});

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}

const goToTest = () => {
  router.push('/test')
}
</script>
