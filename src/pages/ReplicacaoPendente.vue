<template>
  <q-page class="dashboard-page q-pa-md">
    <div class="container">
      <!-- Header -->
      <div class="header-section q-mb-lg">
        <div class="text-h5 text-weight-bold text-white">
          Unidades Monitoradas
        </div>
        <div class="text-subtitle2 text-grey-4">
          Status de replicação e conectividade • Atualizado: {{ lastUpdate }}
        </div>
      </div>

      <div class="q-mb-lg" v-if="!loading && replicacaoData.length > 0">
         <totens-table :data="replicacaoData" />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-container flex flex-center">
        <q-spinner-hourglass color="primary" size="3em" />
        <div class="q-mt-md text-subtitle1 text-grey-5">Carregando dados...</div>
      </div>

      <!-- Error -->
      <q-banner v-if="error" class="bg-negative text-white q-mb-lg rounded-borders">
        <template v-slot:avatar>
          <q-icon name="error" color="white" />
        </template>
        Falha ao carregar os dados: {{ error }}
        <template v-slot:action>
          <q-btn flat color="white" label="Tentar novamente" @click="fetchData" />
        </template>
      </q-banner>

      <!-- Empty State -->
      <div
        v-if="!loading && !error && (!replicacaoData || replicacaoData.length === 0)"
        class="empty-state text-center q-pa-xl"
      >
        <q-icon name="sync_problem" size="5em" color="grey-6" />
        <div class="text-h6 text-grey-5 q-mt-md">Nenhuma pendência encontrada</div>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useQuasar, date } from 'quasar'
import { useMonitorServerStore } from 'stores/monitoramentoServidor'
import TotensTable from 'components/TotensTable.vue'

const store = useMonitorServerStore()

const replicacaoData = ref([])
const loading = ref(true)
const error = ref(null)
const lastUpdate = ref('')
let intervalId = null

const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    const result = await store.fetchReplicacao()

    if (!result.success) {
      throw new Error(result.message || 'Falha ao carregar dados de replicação')
    }

    replicacaoData.value = result.data || []
    lastUpdate.value = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (err) {
    error.value = err.message || 'Erro desconhecido ao buscar replicação'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
  intervalId = setInterval(() => {
    fetchData()
  }, 120000) // 3 min para atualizar dados
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
}
</style>
