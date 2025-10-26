<template>
  <q-page class="dashboard-page">
    <div class="container">
      <!-- Header -->
      <div class="header-section">
        <div class="text-h6 text-weight-bold text-white">
          Ranking de Unidades com Mais Chamados Abertos
        </div>
        <div class="text-subtitle2 text-grey-3">
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
        v-if="!loading && !error && (!topLocais || topLocais.length === 0)"
        class="empty-state text-center q-pa-xl"
      >
        <q-icon name="inbox" size="5em" color="grey-5" />
        <div class="text-h6 text-grey-5 q-mt-md">Nenhum dado disponível</div>
      </div>

<!-- Ranking List -->
<div
  v-if="!loading && !error && topLocais && topLocais.length > 0"
  class="ranking-list"
>
  <q-card
    v-for="(item, index) in sortedTopLocais.slice(0, 10)"
    :key="index"
    class="ranking-item"
    @click="irParaChamadosPorLocal(item)"
  >
    <q-card-section class="ranking-content flex items-center">
      <!-- Medalha ou Posição -->
      <div class="position-container flex flex-center">
        <q-icon
          v-if="index === 0"
          name="emoji_events"
          size="1.5em"
          color="yellow"
        />
        <q-icon
          v-else-if="index === 1"
          name="emoji_events"
          size="1.5em"
          color="grey"
        />
        <q-icon
          v-else-if="index === 2"
          name="emoji_events"
          size="1.5em"
          color="orange"
        />
        <div v-else class="position-number text-white text-weight-bold">
          {{ index + 1 }}
        </div>
      </div>

      <!-- Nome e Chamados -->
      <div class="details flex column justify-center q-pl-md q-pt-sm">
        <div class="text-subtitle2 text-white text-weight-medium">
          {{ extrairLocal(item).nome }}
        </div>
        <div class="text-h6 text-white  q-mt-xs">
          {{ extrairLocal(item).totalChamados }} chamados
        </div>
      </div>
    </q-card-section>
  </q-card>
</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed,onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useChamadosStore } from 'stores/chamados'

import { useRouter } from 'vue-router'
const router = useRouter()

const chamadosStore = useChamadosStore()
const $q = useQuasar()

const topLocais = ref([])
const loading = ref(true)
const error = ref(null)
const lastUpdate = ref('')
let intervalId = null

// Ordena por total de chamados (decrescente)
const sortedTopLocais = computed(() => {
  return [...topLocais.value].sort((a, b) => {
    const countA = a.totalChamados || a.chamados || 0
    const countB = b.totalChamados || b.chamados || 0
    return countB - countA
  })
})

// Classes de cor por posição
const getCardClass = (index) => {
  if (index === 0) return 'bg-yellow-8' // Ouro
  if (index === 1) return 'bg-grey-7'   // Prata
  if (index === 2) return 'bg-orange-8' // Bronze
  if (index % 2 === 0) return 'bg-grey-9'
  return 'bg-grey-8'
}
// Função para extrair nome e total de chamados de cada item
const extrairLocal = (item) => {
  const entries = Object.entries(item)
  if (entries.length === 0) return { nome: 'Desconhecido', totalChamados: 0 }

  const [nome, totalChamados] = entries[0]
  return { nome, totalChamados }
}
// Busca dados da API
const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    const result = await chamadosStore.fetchTopLocais()

    if (!result.success) {
      throw new Error(result.message || 'Falha ao carregar ranking de locais')
    }

    topLocais.value = result.data || []
    lastUpdate.value = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (err) {
    error.value = err.message || 'Erro desconhecido'
  } finally {
    loading.value = false
  }
}

const irParaChamadosPorLocal = (item) => {
  const local = extrairLocal(item)
  if (!local.nome || local.nome === 'Desconhecido') return

  // Codifica o nome para URL (evita problemas com espaços ou caracteres especiais)
  const localEncoded = encodeURIComponent(local.nome)

  router.push({
    path: '/chamados',
    query: { local: localEncoded }
  })
}

// onMounted(() => {
//   fetchData()
// })
onMounted(() => {
  fetchData()
  intervalId = setInterval(fetchData, 180000) // 5 minutos
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
/* Layout Geral */
.dashboard-page {
  background: linear-gradient(135deg, #1c2b36 0%, #2c3e50 100%);
  min-height: 100vh;
  padding: 24px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Cabeçalho */
.header-section {
  margin-bottom: 36px;
  padding: 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Estados de carregamento e erro */
.loading-container {
  min-height: 300px;
}

.empty-state {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

/* Lista de Ranking */
.ranking-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.ranking-item {
  cursor: pointer;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 70px;
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #2d3748;
  border: 1px solid silver;
}

.ranking-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);
  background-color: #333f50;
}

/* Conteúdo interno do item */
.ranking-content {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
}

.position-container {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.position-number {
  font-size: 1rem;
  font-weight: bold;
  color: white;
}

.details {
  flex: 1;
  overflow: hidden;
}

.text-subtitle1 {
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.text-h6 {
  font-size: 1.1rem;
}

/* Responsividade */
@media (max-width: 768px) {
  .header-section {
    padding: 16px;
    margin-bottom: 24px;
  }

  .ranking-item {
    padding: 12px;
    min-height: auto;
  }

  .details {
    q-pl-md: 0;
  }
}
</style>
