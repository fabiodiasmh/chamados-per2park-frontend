<template>
  <q-page class="dashboard-page">
    <div class="container">
      <!-- Header -->
      <div class="header-section">
        <div class="text-h6 text-weight text-white">
          Painel de Acompanhamento de Chamados
        </div>
        <div class="text-subtitle3 text-grey-3">
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
        v-if="!loading && !error && (!chamadosPorStatus || Object.keys(chamadosPorStatus).length === 0)"
        class="empty-state text-center q-pa-xl"
      >
        <q-icon name="inbox" size="5em" color="grey-5" />
        <div class="text-h6 text-grey-5 q-mt-md">Nenhum dado disponível</div>
      </div>


<div
  v-if="!loading && !error && chamadosPorStatus && Object.keys(chamadosPorStatus).length > 0"
  class="stats-grid"
>
  <q-card
    v-for="status in orderedStatusList"
    :key="status"
    class="stat-card"
    :class="getStatusClass(status)"
  >
    <q-card-section class="stat-content">
      <div class="number-display">{{ chamadosPorStatus[status] || 0 }}</div>
      <div class="status-label">{{ status }}</div>
    </q-card-section>
    <q-card-section class="icon-section">
      <q-icon :name="getIconForStatus(status)" size="24px" color="white" />
    </q-card-section>
  </q-card>
</div>
   <!-- Gráfico 1: Chamados com Alto Volume -->
 <!-- Substitua toda a seção de gráficos por isso -->
<div v-if="!loading && !error && chamadosPorStatus && Object.keys(chamadosPorStatus).length > 0" class="chart-section q-mt-xl">
  <q-card class="chart-card">
    <q-card-section class="text-center">
      <div class="text-h6 text-white q-mb-sm">Distribuição de Chamados por Status</div>
      <div class="chart-container">
        <Doughnut :data="fullChartData" :options="chartOptions" />
      </div>
    </q-card-section>
  </q-card>
</div>
    </div>
  </q-page>
</template>

<script setup>

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,        // ← necessário para doughnut/pie
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Doughnut } from 'vue-chartjs' // ← use Doughnut, não Bar
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,        // ← registrado
  ChartDataLabels
)

import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useChamadosStore } from 'stores/chamados'



const chamadosStore = useChamadosStore()
const $q = useQuasar()



const chamadosPorStatus = ref({})
const loading = ref(true)
const error = ref(null)
const lastUpdate = ref('')
let intervalId = null
var teste = ref(null)

// ✅ Dados completos para um único gráfico com todos os status
const fullChartData = computed(() => {
  const labels = orderedStatusList.value.filter(status => chamadosPorStatus.value[status] > 0)
  const data = labels.map(status => chamadosPorStatus.value[status])
  const backgroundColor = labels.map(status => getStatusColor(status))

  return {
    labels,
    datasets: [{
      data,
      backgroundColor,
      borderColor: '#1C2B36',
      borderWidth: 2,
      hoverOffset: 10
    }]
  }
})

// ✅ Opções do gráfico com porcentagens visíveis
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        color: '#fff',
        font: { size: 12 },
        padding: 15
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || ''
          const value = context.raw
          const total = totalChamados.value
          const percent = total ? ((value / total) * 100).toFixed(1) : 0
          return `${label}: ${value} chamados (${percent}%)`
        }
      }
    },
    datalabels: {
      color: '#fff',
      font: {
        weight: 'bold',
        size: 14
      },
      formatter: (value, context) => {
        const total = totalChamados.value
        const percent = total ? ((value / total) * 100).toFixed(1) : 0
        return `${percent}%`
      },
      anchor: 'center',
      align: 'center'
    }
  },
  cutout: '60%' // rosca (doughnut). Use '0%' para gráfico de pizza.
}))

// Ícones por status — ATUALIZADOS
const getIconForStatus = (status) => {
teste = 'handshake'

console.log("aa ",chamadosPorStatus.value)  ;

if (chamadosPorStatus.value['Aberto'] > 0) {
  teste = 'warning'
}else{
  teste ='handshake'
}



  const icons = {
    'Aberto': teste,
    'Em Atendimento': 'headset',
    'Feedback': 'feedback',
    'Encaminhado Nível 2': 'call_made',
    'Encaminhado Nível 3': 'call_received',
    'Em Análise': 'analytics',
     'Aguardando assistencia': 'build',
  'Aguardando Resposta': 'hotel'
  }
  return icons[status] || 'help_outline'
}

// ✅ Lista ordenada de status conforme solicitado
const orderedStatusList = computed(() => [
  'Aberto',
  'Em Atendimento',
  'Em Análise',
  'Feedback',
  'Encaminhado Nível 2',
  'Encaminhado Nível 3',
  'Aguardando assistencia',
  'Aguardando Resposta'
])
// .filter(status => chamadosPorStatus.value[status] !== null)) // só mostra se existir

// Classes de cor por status
var cor = ref(null)
const getStatusClass = (status) => {

  console.log(chamadosPorStatus.value['Aberto']);

  if (chamadosPorStatus.value['Aberto'] == null) {
    cor ='bg-green-8'
  }else{
  cor = 'bg-red-7'
}
  const classes = {

    'Aberto': cor,
    'Em Atendimento': 'bg-orange-5',
    'Feedback': 'bg-blue-7',
    'Encaminhado Nível 2': 'bg-indigo-7',
    'Encaminhado Nível 3': 'bg-purple-7',
    'Em Análise': 'bg-amber-10',
    'Aguardando assistencia': 'bg-blue-grey-6',
  }
  return classes[status] || 'bg-grey-8'
}



// Formata data/hora
const formatDateTime = () => {
  const now = new Date()
  return now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    // second: '2-digit'
  })
}

// Busca dados
const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    const result = await chamadosStore.fetchChamadosPorStatus()

    if (!result.success) {
      throw new Error(result.message || 'Falha ao carregar dados')
    }

    chamadosPorStatus.value = result.data || {}

    lastUpdate.value = formatDateTime()
  } catch (err) {
    error.value = err.message || 'Erro desconhecido'
  } finally {
    loading.value = false
  }
}

// Preparar dados para gráfico com porcentagem
const totalChamados = computed(() => {
  return Object.values(chamadosPorStatus.value).reduce((sum, val) => sum + val, 0)
})


const getStatusColor = (status) => {
  const colors = {
    'Aberto': '#F44336',
    'Em Atendimento': '#FFA500',
    'Feedback': '#2196F3',
    'Encaminhado Nível 2': '#3F51B5',
    'Encaminhado Nível 3': '#9C27B0',
    'Em Análise': '#FFC107'
  }
  return colors[status] || '#666'
}

const highVolumeData = computed(() => {
  const labels = ['Aguardando Resposta', 'Aguardando assistencia']
  const data = [
    chamadosPorStatus.value['Aguardando Resposta'] || 0,
    chamadosPorStatus.value['Aguardando assistencia'] || 0
  ]
  const backgroundColor = ['#6c757d', '#607D8B']

  return {
    labels,
    datasets: [{
      label: 'Aguardando',
      data,
      backgroundColor,
      borderColor: '#1C2C36',
      borderWidth: 2,
      hoverOffset: 10
    }]
  }
})

const lowVolumeData = computed(() => {
  const labels = orderedStatusList.value.filter(status =>
    !['Aguardando Resposta', 'Aguardando assistencia'].includes(status) &&
    chamadosPorStatus.value[status] > 0
  )

  const data = labels.map(status => chamadosPorStatus.value[status])
  const backgroundColor = labels.map(status => getStatusColor(status))

  return {
    labels,
    datasets: [{
      label: 'Chamados',
      data,
      backgroundColor,
      borderColor: '#1C2B36',
      borderWidth: 2,
      hoverOffset: 8
    }]
  }
})


const chartOptionsHigh = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        color: '#fff',
        font: { size: 12 }
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || ''
          const value = context.raw
          const total = totalChamados.value
          const percent = total ? ((value / total) * 100).toFixed(1) : 0
          // return `${label}: ${value} chamados (${percent}%)`
        }
      }
    },
    datalabels: {
      color: '#fff',
      font: { weight: 'bold', size: 14 },
      formatter: (value, context) => {
        const total = totalChamados.value
        const percent = total ? ((value / total) * 100).toFixed(1) : 0
        // return `${percent}%`
      },
      anchor: 'center',
      align: 'center'
    }
  },
  cutout: '50%' // ← isso faz ser "doughnut" (rosca). Use '0%' para pie.
}))

// chartOptionsLow é idêntico, então você pode reutilizar ou copiar
const chartOptionsLow = chartOptionsHigh // ou copie o mesmo objeto se forem iguais


onMounted(() => {
  fetchData()
  intervalId = setInterval(fetchData, 180000) // 5 minutos
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>

.stat-card {
   border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  min-height: 110px;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
}

.stat-content {
  padding: 6px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
}

.number-display {
  font-size: 2.7rem;
  font-weight: 700;
  color: white;
  line-height: 1;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.status-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  letter-spacing: 0.3px;
}

.icon-section {
  width: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background: rgba(0, 0, 0, 0.15); */
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
}

.chart-container {
  height: 220px;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}



/* ------------------------- */
.dashboard-page {
  background: linear-gradient(135deg, #1C2B36 0%, #2C3E50 100%);
  min-height: 100vh;
  padding: 24px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 16px;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 24px;
}



.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
}





.chart-section {
  margin-top: 40px;
  text-align: center;
}

.chart-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
}


</style>
