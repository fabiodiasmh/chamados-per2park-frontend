<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <div class="text-h4">Teste de Conexão com API</div>
        <div class="text-subtitle1 text-grey-7">Verificar se as APIs estão funcionando</div>
      </div>

      <!-- Test Buttons -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Testes de API</div>
            <div class="row q-gutter-md">
              <q-btn
                color="primary"
                label="Testar Login"
                @click="testLogin"
                :loading="loading.login"
                icon="login"
              />
              <q-btn
                color="secondary"
                label="Testar Chamados"
                @click="testChamados"
                :loading="loading.chamados"
                icon="assignment"
              />
              <q-btn
                color="accent"
                label="Testar Status"
                @click="testStatus"
                :loading="loading.status"
                icon="analytics"
              />
              <q-btn
                color="positive"
                label="Testar Locais"
                @click="testLocais"
                :loading="loading.locais"
                icon="place"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Results -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Resultados dos Testes</div>
            <div v-if="results.length === 0" class="text-center text-grey-6 q-py-lg">
              <q-icon name="help" size="3em" />
              <div class="q-mt-sm">Execute os testes para ver os resultados</div>
            </div>
            <div v-else>
              <q-list bordered separator>
                <q-item v-for="(result, index) in results" :key="index">
                  <q-item-section avatar>
                    <q-avatar :color="result.success ? 'positive' : 'negative'" text-color="white">
                      <q-icon :name="result.success ? 'check' : 'close'" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ result.test }}</q-item-label>
                    <q-item-label caption>{{ result.message }}</q-item-label>
                    <q-item-label caption v-if="result.data">
                      <pre class="text-caption">{{ JSON.stringify(result.data, null, 2) }}</pre>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Auth Status -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Status da Autenticação</div>
            <div class="row q-gutter-md">
              <div class="col-12 col-md-6">
                <q-list bordered>
                  <q-item>
                    <q-item-section>
                      <q-item-label>Autenticado</q-item-label>
                      <q-item-label caption>
                        <q-badge :color="authStore.isAuthenticated ? 'positive' : 'negative'">
                          {{ authStore.isAuthenticated ? 'Sim' : 'Não' }}
                        </q-badge>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label>Email do Usuário</q-item-label>
                      <q-item-label caption>{{ authStore.userEmail || 'N/A' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label>Token</q-item-label>
                      <q-item-label caption>{{ authStore.token || 'N/A' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
              <div class="col-12 col-md-6">
                <q-list bordered>
                  <q-item>
                    <q-item-section>
                      <q-item-label>Chamados Carregados</q-item-label>
                      <q-item-label caption>{{ chamadosStore.chamados.length }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label>Status Carregados</q-item-label>
                      <q-item-label caption>{{ Object.keys(chamadosStore.chamadosPorStatus).length }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label>Locais Carregados</q-item-label>
                      <q-item-label caption>{{ chamadosStore.topLocais.length }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from 'stores/auth'
import { useChamadosStore } from 'stores/chamados'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

defineOptions({
  name: 'TestPage'
});

const authStore = useAuthStore()
const chamadosStore = useChamadosStore()
const $q = useQuasar()

const loading = ref({
  login: false,
  chamados: false,
  status: false,
  locais: false
})

const results = ref([])

onMounted(() => {
  // Initialize auth state
  authStore.initializeAuth()
})

const addResult = (test, success, message, data = null) => {
  results.value.unshift({
    test,
    success,
    message,
    data,
    timestamp: new Date().toLocaleTimeString()
  })
}

const testLogin = async () => {
  loading.value.login = true
  try {
    const credentials = {
      Login: 'portaria@perto.com.br',
      Password: 'perto123'
    }

    const response = await api.post('/login', credentials)
    addResult(
      'Login',
      true,
      'Login realizado com sucesso',
      response.data
    )

    // Update auth store
    authStore.isAuthenticated = true
    authStore.user = credentials
    authStore.token = response.data?.token || 'session-token'

  } catch (error) {
    addResult(
      'Login',
      false,
      `Erro: ${error.response?.data?.message || error.message}`,
      error.response?.data
    )
  } finally {
    loading.value.login = false
  }
}

const testChamados = async () => {
  loading.value.chamados = true
  try {
    const response = await api.get('/chamados')
    addResult(
      'Chamados',
      true,
      `${response.data?.length || 0} chamados encontrados`,
      response.data
    )

    // Update store
    chamadosStore.chamados = response.data || []

  } catch (error) {
    addResult(
      'Chamados',
      false,
      `Erro: ${error.response?.data?.message || error.message}`,
      error.response?.data
    )
  } finally {
    loading.value.chamados = false
  }
}

const testStatus = async () => {
  loading.value.status = true
  try {
    const response = await api.get('/chamadosPorStatus')
    addResult(
      'Status',
      true,
      'Status carregados com sucesso',
      response.data
    )

    // Update store
    chamadosStore.chamadosPorStatus = response.data || {}

  } catch (error) {
    addResult(
      'Status',
      false,
      `Erro: ${error.response?.data?.message || error.message}`,
      error.response?.data
    )
  } finally {
    loading.value.status = false
  }
}

const testLocais = async () => {
  loading.value.locais = true
  try {
    const response = await api.get('/locais')
    addResult(
      'Locais',
      true,
      `${response.data?.length || 0} locais encontrados`,
      response.data
    )

    // Update store
    chamadosStore.topLocais = response.data || []

  } catch (error) {
    addResult(
      'Locais',
      false,
      `Erro: ${error.response?.data?.message || error.message}`,
      error.response?.data
    )
  } finally {
    loading.value.locais = false
  }
}
</script>
