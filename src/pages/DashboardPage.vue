<template>
  <q-page class="dashboard-page q-pa-md">
    <div class="container">
      <!-- Header -->
      <div class="header-section q-mb-md">
        <div class="text-h5 text-weight-bold text-white">
          Painel de Acompanhamento
        </div>
        <div class="text-caption text-grey-5">
          Atualizado em: {{ lastUpdate }}
        </div>
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
  class="stat-card glass"
  :class="getStatusClass(status)"
  @click="irParaChamadosComStatus(status)"
>
    <q-card-section class="stat-content">
      <div class="number-display text-white">{{ chamadosPorStatus[status] || 0 }}</div>
      <div class="status-label text-white">{{ status }}</div>
    </q-card-section>
    <q-card-section class="icon-section">
      <q-icon :name="getIconForStatus(status)" size="28px" class="text-white" />
    </q-card-section>
  </q-card>
</div>

<!-- Gráfico e novo card lado a lado -->
<div
  v-if="!loading && !error && chamadosPorStatus && Object.keys(chamadosPorStatus).length > 0"
  class="charts-row q-mt-xl"
>
  <!-- Gráfico de Distribuição -->
  <q-card class="chart-card half-width glass">
    <q-card-section class="text-center q-pa-lg">
      <div class="text-h6 text-white q-mb-md">Distribuição de Chamados</div>
      <div class="chart-container">
        <Doughnut :data="fullChartData" :options="chartOptions" />
      </div>
    </q-card-section>
  </q-card>

      <servidores-offline-card class="q-px-md q-pb-sm glass"  />

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

// Importe o novo componente
import ServidoresOfflineCard from 'components/ServidoresOfflineCard.vue'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,        // ← registrado
  ChartDataLabels
)

import { useRouter } from 'vue-router'
const router = useRouter()

import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useChamadosStore } from 'stores/chamados'

import {useMonitorServerStore} from 'stores/monitoramentoServidor'


const chamadosStore = useChamadosStore()

const storeMonitoramento = useMonitorServerStore()
const $q = useQuasar()



const chamadosPorStatus = ref({})
const loading = ref(true)
const error = ref(null)
const lastUpdate = ref('')
let intervalId = null
var teste = ref(null)

const irParaChamadosComStatus = (statusLabel) => {
  // Mapeia o rótulo textual para o código numérico do status
  const statusMap = {
    'Aberto': 0,
    'Em Atendimento': 2,
    'Em Análise': 1,
    'Feedback': 8,
    'Encaminhado Nível 2': 12,
    'Encaminhado Nível 3': 10,
    'Aguardando assistencia': 11,
    'Aguardando Resposta': 9,
  }

  const statusCode = statusMap[statusLabel]

  if (statusCode === undefined) return

  // Navega para a página de chamados com o filtro na query
  router.push({
    path: '/chamados',
    query: { status: statusCode }
  })
}

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
      borderColor: 'transparent',
      borderWidth: 0,
      hoverOffset: 15
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
        color: '#B0B0B0',
        font: { size: 11, family: 'Roboto' },
        padding: 15,
        usePointStyle: true
      }
    },
    datalabels: {
      color: '#fff',
      font: {
        weight: 'bold',
        size: 13
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
  cutout: '65%' // rosca (doughnut). Use '0%' para gráfico de pizza.
}))

// Ícones por status — ATUALIZADOS
const getIconForStatus = (status) => {
teste = 'handshake'

// console.log("aa ",chamadosPorStatus.value)  ;

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
    'Encaminhado Nível 3': 'logo_dev',
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
const getStatusClass = (status) => {
  const classes = {
    'Aberto': 'gradient-red',
    'Em Atendimento': 'gradient-orange',
    'Em Análise': 'gradient-yellow',
    'Feedback': 'gradient-blue',
    'Encaminhado Nível 2': 'gradient-indigo',
    'Encaminhado Nível 3': 'gradient-purple',
    'Aguardando assistencia': 'gradient-blue-grey',
    'Aguardando Resposta': 'gradient-teal'
  }
  return classes[status] || 'gradient-default'
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
    'Aberto': '#EF5350', // Red (Primary from gradient-red)
    'Em Atendimento': '#FFA726', // Orange (Primary from gradient-orange)
    'Feedback': '#42A5F5', // Blue (Primary from gradient-blue)
    'Encaminhado Nível 2': '#5C6BC0', // Indigo (Primary from gradient-indigo)
    'Encaminhado Nível 3': '#AB47BC', // Purple (Primary from gradient-purple)
    'Em Análise': '#FFEE58', // Yellow (Primary from gradient-yellow)
    'Aguardando assistencia': '#78909C', // Blue Grey (Primary from gradient-blue-grey)
    'Aguardando Resposta': '#26A69A' // Teal (Primary from gradient-teal)
  }
  return colors[status] || '#4B5563' // Default Gray
}

let chamadosInterval = null
let replicacaoInterval = null

onMounted(() => {
  fetchData()
  storeMonitoramento.fetchReplicacao()

  chamadosInterval = setInterval(fetchData, 120000)
  replicacaoInterval = setInterval(() => {
    storeMonitoramento.fetchReplicacao()
  }, 120000)

  // await chamadosStore.meus_chamados();
})

onUnmounted(() => {
  if (chamadosInterval) clearInterval(chamadosInterval)
  if (replicacaoInterval) clearInterval(replicacaoInterval)
})
</script>

<style scoped>

.dashboard-page {
  /* background: linear-gradient(135deg, #1C2B36 0%, #2C3E50 100%); */
  /* Use global background */
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  align-items: baseline;
  gap: 16px;
  flex-wrap: wrap;
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
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.stat-card {
  cursor: pointer;
  border-radius: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  height: 160px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Gradients for cards */
.gradient-red { background: linear-gradient(135deg, #EF5350 0%, #C62828 100%) !important; }
.gradient-orange { background: linear-gradient(135deg, #FFA726 0%, #EF6C00 100%) !important; }
.gradient-yellow { background: linear-gradient(135deg, #FFEE58 0%, #F9A825 100%) !important; }
.gradient-blue { background: linear-gradient(135deg, #42A5F5 0%, #1565C0 100%) !important; }
.gradient-indigo { background: linear-gradient(135deg, #5C6BC0 0%, #283593 100%) !important; }
.gradient-purple { background: linear-gradient(135deg, #AB47BC 0%, #6A1B9A 100%) !important; }
.gradient-blue-grey { background: linear-gradient(135deg, #78909C 0%, #37474F 100%) !important; }
.gradient-teal { background: linear-gradient(135deg, #26A69A 0%, #00695C 100%) !important; }
.gradient-default { background: linear-gradient(135deg, #4B5563 0%, #1F2937 100%) !important; }


.stat-content {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  z-index: 1;
}

.number-display {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.status-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.icon-section {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.charts-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.half-width {
  flex: 1 1 400px;
}

.chart-card {
  border-radius: 24px;
  overflow: hidden;
}

.chart-container {
  height: 300px;
  position: relative;
}

.opacity-80 {
  opacity: 0.8;
}
</style>
