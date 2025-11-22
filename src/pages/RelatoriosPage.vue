<template>
  <q-page class="dashboard-page q-pa-md">
    <div class="container">
      <!-- Header -->
      <div class="header-section q-mb-lg">
        <div class="text-h5 text-weight-bold text-white">
          Ranking de Unidades
        </div>
        <div class="text-subtitle2 text-grey-4">
          Unidades com mais chamados abertos • Atualizado: {{ lastUpdate }}
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
        v-if="!loading && !error && (!topLocais || topLocais.length === 0)"
        class="empty-state text-center q-pa-xl"
      >
        <q-icon name="emoji_events" size="5em" color="grey-6" />
        <div class="text-h6 text-grey-5 q-mt-md">Nenhum dado disponível</div>
      </div>

      <!-- Ranking List -->
      <div
        v-if="!loading && !error && topLocais && topLocais.length > 0"
        class="row q-col-gutter-md"
      >
        <div
          v-for="(item, index) in sortedTopLocais.slice(0, 12)"
          :key="index"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <q-card
            class="ranking-item glass-light column items-center text-center q-pa-md"
            @click="irParaChamadosPorLocal(item)"
          >
            <!-- Medalha ou Posição -->
            <div class="position-badge q-mb-sm">
              <q-icon
                v-if="index === 0"
                name="emoji_events"
                size="3em"
                color="yellow-8"
                class="drop-shadow"
              />
              <q-icon
                v-else-if="index === 1"
                name="emoji_events"
                size="3em"
                color="grey-5"
                class="drop-shadow"
              />
              <q-icon
                v-else-if="index === 2"
                name="emoji_events"
                size="3em"
                color="orange-8"
                class="drop-shadow"
              />
              <div v-else class="position-circle flex flex-center text-h6 text-white text-weight-bold">
                {{ index + 1 }}
              </div>
            </div>

            <!-- Nome e Chamados -->
            <div class="full-width">
              <div class="text-subtitle1 text-white text-weight-bold ellipsis-2-lines q-mb-xs" style="min-height: 48px;">
                {{ extrairLocal(item).nome }}
              </div>
              <q-chip
                color="primary"
                text-color="white"
                size="sm"
                class="text-weight-bold"
              >
                {{ extrairLocal(item).totalChamados }} chamados
              </q-chip>
            </div>
          </q-card>
        </div>
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
  intervalId = setInterval(fetchData, 180000) // 3 minutos
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
  max-width: 1200px;
  margin: 0 auto;
}

.ranking-item {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}

.ranking-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.position-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.drop-shadow {
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}
</style>
