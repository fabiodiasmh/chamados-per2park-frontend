<template>
  <q-page class="dashboard-page">
    <div class="container">
      <!-- Header -->
      <div class="header-section">
        <div class="text-h4 text-weight-bold text-white">
          Painel de Acompanhamento de Chamados
        </div>
        <div class="text-subtitle1 text-grey-3">
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

      <!-- Stats Cards Grid
      <div
        v-if="!loading && !error && chamadosPorStatus && Object.keys(chamadosPorStatus).length > 0"
        class="stats-grid"
      >
        <q-card
          v-for="(count, status) in chamadosPorStatus"
          :key="status"
          class="stat-card"
          :class="getStatusClass(status)"
        >
          <q-card-section class="stat-content">
            <div class="text-h4 text-weight-bold text-white">
              {{ count }}
            </div>
            <div class="text-subtitle1 text-white text-weight-medium">
              {{ status }}
            </div>
          </q-card-section>
          <q-card-section class="icon-section">
            <q-icon :name="getIconForStatus(status)" size="2.5em" color="white" />
          </q-card-section>
        </q-card>
      </div> -->
<!-- Stats Cards Grid - Ordenado e centralizado -->
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
    <q-card-section class="stat-content flex flex-center text-center">
      <div class="number-display text-weight-bolder">
        {{ chamadosPorStatus[status] || 0 }}
      </div>
      <div class="status-label text-subtitle1 text-white text-weight-medium q-mt-xs">
        {{ status }}
      </div>
    </q-card-section>
    <q-card-section class="icon-section flex flex-center">
      <q-icon :name="getIconForStatus(status)" size="2.5em" color="white" />
    </q-card-section>
  </q-card>
</div>
      <!-- Pie Chart -->
      <div v-if="!loading && !error && chamadosPorStatus && Object.keys(chamadosPorStatus).length > 0" class="chart-section">
        <q-card class="chart-card">
          <q-card-section class="text-center">
            <div class="text-h6 text-white q-mb-sm">Distribuição dos Chamados</div>
            <div style="height: 300px; max-width: 800px; margin: 0 auto;">
              <Pie :data="chartData" :options="chartOptions" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useChamadosStore } from 'stores/chamados'

// chart.js + vue-chartjs
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Pie } from 'vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels' // ✅ Plugin de labels

// Registrar módulos do Chart.js + plugin
ChartJS.register(Title, Tooltip, Legend, ArcElement, ChartDataLabels)

const chamadosStore = useChamadosStore()
const $q = useQuasar()

const chamadosPorStatus = ref({})
const loading = ref(true)
const error = ref(null)
const lastUpdate = ref('')
let intervalId = null

// Ícones por status — ATUALIZADOS
const getIconForStatus = (status) => {
  const icons = {
    'Aberto': 'report_problem',
    'Em Atendimento': 'headset',
    'Feedback': 'feedback',
    'Encaminhado Nível 2': 'call_made',
    'Encaminhado Nível 3': 'call_received',
    'Em Análise': 'analytics'
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
  'Encaminhado Nível 3'
].filter(status => chamadosPorStatus.value[status] !== undefined)) // só mostra se existir

// Classes de cor por status
const getStatusClass = (status) => {
  const classes = {
    'Aberto': 'bg-red-6',
    'Em Atendimento': 'bg-orange-6',
    'Feedback': 'bg-blue-7',
    'Encaminhado Nível 2': 'bg-indigo-7',
    'Encaminhado Nível 3': 'bg-purple-7',
    'Em Análise': 'bg-amber-6'
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
    second: '2-digit'
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

const chartData = computed(() => {
  const labels = Object.keys(chamadosPorStatus.value)
  const values = Object.values(chamadosPorStatus.value)
  const colors = labels.map((status) => getStatusColor(status))

  return {
    labels,
    datasets: [
      {
        label: 'Chamados',
        data: values,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#1C2B36'
      }
    ]
  }
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

// ✅ Opções do gráfico com porcentagem dentro das fatias
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        color: '#FFFFFF',
        font: { size: 12 }
      }
    },
    // tooltip: {
    //   callbacks: {
    //     label: (context) => {
    //       const label = context.label || ''
    //       const value = context.parsed
    //       const total = totalChamados.value
    //       const percent = total ? ((value / total) * 100).toFixed(1) : 0
    //       return `${label}: ${value} (${percent}%)`
    //     }
    //   }
    // },
    tooltip: {
  callbacks: {
    label: (context) => {
      const label = context.label || ''
      const value = context.parsed
      const total = totalChamados.value
      const percent = total ? ((value / total) * 100).toFixed(1) : 0
      return `${label}: ${value} chamados (${percent}%)`
    },
    title: () => null // remove título duplicado
  }
},
    // ✅ Plugin para exibir porcentagem DENTRO das fatias
    datalabels: {
      color: '#fff',
      font: {
        weight: 'bold',
        size: 14
      },
      formatter: (value) => {
        const total = totalChamados.value
        if (total === 0) return ''
        const percent = ((value / total) * 100).toFixed(1)
        return `${percent}%`
      },
      display: (context) => {
        const value = context.dataset.data[context.dataIndex]
        const total = totalChamados.value
        const percent = total ? (value / total) * 100 : 0
        return percent > 5 // Só mostra se for > 5% para não poluir
      }
    }
  },
  elements: {
    arc: {
      borderWidth: 2
    }
  }
}))

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
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  min-height: 140px; /* aumentado para dar espaço ao texto centralizado */
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
}

.stat-content {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.number-display {
  font-size: 3rem; /* destaque máximo no número */
  line-height: 1;
  font-weight: 800; /* extra bold */
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.status-label {
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.icon-section {
  width: 80px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
}

/* Responsividade */
@media (max-width: 768px) {
  .stat-card {
    flex-direction: column;
    min-height: 160px;
  }

  .icon-section {
    width: 100%;
    height: 70px;
    border-top-right-radius: 0;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }

  .number-display {
    font-size: 2.5rem;
  }

  .stat-content {
    padding: 16px;
  }
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
  margin-bottom: 36px;
  padding: 24px;
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

.stat-card {
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  min-height: 120px;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
}

.stat-content {
  padding: 20px;
  flex: 1;
}

.icon-section {
  width: 80px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
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

/* Responsividade */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .icon-section {
    width: 100%;
    height: 80px;
    border-top-right-radius: 0;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }

  .stat-content {
    padding: 16px;
  }

  .chart-section {
    margin-top: 24px;
  }
}
</style>
