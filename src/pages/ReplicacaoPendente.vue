<template>
  <q-page class="dashboard-page">
    <div class="container">
      <!-- Header -->
      <div class="header-section">
        <div class="text-h6 text-weight-bold text-white">
          Unidades monitoradas
        </div>
        <div class="text-caption text-grey-3">
          Atualizado em: {{ lastUpdate }}
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-container flex flex-center">
        <q-spinner-hourglass color="primary" size="3em" />
        <div class="q-mt-md text-subtitle1 text-grey-7">Carregando dados...</div>
      </div>

      <!-- Error -->
      <q-banner v-if="error" class="bg-negative text-white q-mb-lg">
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
        <q-icon name="sync_problem" size="5em" color="grey-5" />
        <div class="text-h6 text-grey-5 q-mt-md">Nenhuma pendência encontrada</div>
      </div>

      <!-- Replicação List -->






<totens-table :data="replicacaoData" />
 <div class="q-mt-sm tabela ">

<TabelaTbs :replicacaoData="replicacaoData" />



  </div>

      </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { date } from 'quasar'
import { useMonitorServerStore } from 'stores/monitoramentoServidor'

import TabelaTbs from 'src/components/TabelaTbs.vue'

import TotensTable from 'components/TotensTable.vue'

const store = useMonitorServerStore()
// const $q = useQuasar()

const replicacaoData = ref([])
const replicacaoDataTeste = ref(null)
const loading = ref(true)
const error = ref(null)
const lastUpdate = ref('')
let intervalId = null





 const formatDate = (isoString) => {
  return date.formatDate(isoString, 'DD/MM/YYYY HH:mm:ss')
}

   const getMinutesDiff = (isoString) => {
  const now = new Date()
  const past = new Date(isoString)
  const diffMs = now - past
  return Math.floor(diffMs / 60000)
}

 const isOffline = (isoString) => {
  const diff = getMinutesDiff(isoString)
  return diff > 1 // offline se passou mais de 10 minutos
}

const getElapsedTime = (isoString) => {
  if (!isoString) return '-'

  const now = new Date()
  const past = new Date(isoString)
  const diffMs = now - past

  const diffMinutes = Math.floor(diffMs / 60000)
  const days = Math.floor(diffMinutes / 1440) // 1440 min = 24h
  const hours = Math.floor((diffMinutes % 1440) / 60)
  const minutes = diffMinutes % 60

  if (days > 0) return `${days}d ${hours}h ${minutes}min`
  if (hours > 0) return `${hours}h ${minutes}min`
  return `${minutes} min`
}


const getCardClassByStatus = (errors, pendencies) => {
  if (errors > 0) return 'bg-orange-4'
  if (pendencies > 0) return 'bg-light-blue-1'
  return 'bg-green-9'
}

const replicacaoComPendencias = computed(() => {
  return replicacaoData.value.filter(item =>
    item.ReplicationQueue?.Pendencies > 5
  )
})



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

// onMounted(() => {
//   fetchData()
//   intervalId = setInterval(fetchData, 180000) // 3 minutos
// })
onMounted(() => {
  fetchData()
  intervalId = setInterval(() => {
    fetchData()
  }, 180000) // 3 min para atualizar dados

  // Atualiza o contador de tempo a cada minuto
  setInterval(() => {}, 60000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
/* Estilos reutilizados do seu template original */
.dashboard-page {
  background: linear-gradient(135deg, #1C2B36 0%, #2C3E50 100%);
  min-height: 100vh;
  padding: 24px;
}

.container {
  /* max-width: 1400px; */
  /* margin: 0 auto; */
}

.header-section {
  margin-bottom: 12px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.loading-container {
  min-height: 300px;
}

.empty-state {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

.ranking-list {
  /* color: red; */
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  justify-content: start;
  /* flex-direction: column; */
  gap: 12px;
  /* width: 100%; */
}

.ranking-item {
  width: 290px;
  height: 125px;
  /* border-radius: 12px; */
  /* box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2); */
  /* transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); */
  /* min-height: 70px; */
  display: flex;
  align-items: center;
  /* padding: 6px; */
  border: 2px solid silver;
}

.ranking-item:hover {
  /* transform: translateY(-2px); */
  /* box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3); */
}

.ranking-content {
  /* width: 100%; */
  /* display: flex; */
  /* align-items: center; */
  /* gap: 12px; */
}

.position-container {
  /* width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2); */
}

.details {
  /* flex: 1; */
  /* overflow: hidden; */
}

.text-subtitle1 {
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.text-caption {
  /* font-size: 0.8rem; */
}

.tabela{
  /* font-size: 5px; */
width: 500px;
}

.tab  {
  font-size: 6px;

}



/* Responsividade */
@media (max-width: 768px) {
  .ranking-item {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }

  .position-container {
    margin-bottom: 12px;
  }

  .details {
    align-items: center;
    text-align: center;
  }
}
</style>
