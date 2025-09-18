<template>
  <q-page class="dashboard-page">
    <div class="container">
      <!-- Header Compacto -->
      <div class="header-section">
        <div class="text-caption text-weight-bold text-white">
          📬 Chamados Abertos
          {{ chamadosFiltrados.length }} chamados • Atualizado: {{ lastUpdate }}
        </div>

      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-container flex flex-center">
        <q-spinner-hourglass color="primary" size="2em" />
        <div class="q-mt-md text-caption text-grey-6">Carregando...</div>
      </div>

      <!-- Error -->
      <q-banner v-if="error" class="bg-negative text-white q-mb-md">
        <template v-slot:avatar>
          <q-icon name="error" color="white" size="sm" />
        </template>
        {{ error }}
        <template v-slot:action>
          <q-btn flat color="white" size="sm" label="Tentar novamente" @click="fetchData" />
        </template>
      </q-banner>

      <!-- Empty State -->
      <div
        v-if="!loading && !error && (!chamadosFiltrados || chamadosFiltrados.length === 0)"
        class="empty-state text-center q-py-xl"
      >
        <q-icon name="inbox" size="4em" color="grey-5" />
        <div class="text-subtitle1 text-grey-5 q-mt-md">Nenhum chamado aberto no momento</div>
      </div>

      <!-- Lista Compacta de Chamados -->
      <div
        v-if="!loading && !error && chamadosFiltrados && chamadosFiltrados.length > 0"
        class="chamados-list"
      >
        <q-card
          v-for="chamado in chamadosFiltrados"
          :key="chamado.Id"
          class="chamado-card"
          @click="mostrarDescricaoCompleta(chamado)"
        >
          <q-card-section class="p-0">
            <!-- Cabeçalho do Chamado -->



<!-- Cabeçalho: ID/Data — Local — Categoria -->
<!-- <div class="chamado-header flex items-center q-pa-sm"> -->
  <div class="chamado-header flex items-center q-pa-sm nowrap">
  <!-- Esquerda: ID + Data -->
  <div class="text-h6 text-blue-5 min-width-fit">
    {{ chamado.Id }} • {{ formatarData(chamado.OpeningDate) }}
  </div>

  <!-- Centro: Nome do Local -->
  <div class="text-h5 text-orange-3 text-weight-medium text-center flex-grow">
    {{ chamado.Local?.Name || 'Local não informado' }}
  </div>

  <!-- Direita: Categoria -->
  <div class="text-body2 text-blue-3 text-weight-medium min-width-fit">
    {{ chamado.Category?.Name || '—' }}
  </div>
</div>



         <!-- Descrição (3 linhas visíveis) -->
<div class="chamado-descricao q-px-sm q-pb-sm">
  <div class="text-body1 text-grey-2 line-clamp-3">
    {{ chamado.Description }}
  </div>
</div>




          </q-card-section>
        </q-card>
      </div>
    </div>


  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useChamadosStore } from 'stores/chamados'

const chamadosStore = useChamadosStore()
const $q = useQuasar()

const chamados = ref([])
const loading = ref(true)
const error = ref(null)
const lastUpdate = ref('')
const dialogDescricao = ref(false)
const chamadoSelecionado = ref(null)
let intervalId = null

// Filtra e ordena chamados (Status = 0, por data crescente)
const chamadosFiltrados = computed(() => {
  return [...chamados.value]
    .filter(chamado => chamado.Status === 0)
    .sort((a, b) => new Date(b.OpeningDate) - new Date(a.OpeningDate))
})

// Formata data para exibição amigável
const formatarData = (dataISO) => {
  if (!dataISO) return '—'
  const data = new Date(dataISO)
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Trunca texto longo
const truncarTexto = (texto, limite) => {
  if (!texto) return ''
  return texto.length > limite ? texto.substring(0, limite) + '…' : texto
}

// Mostra descrição completa em modal
const mostrarDescricaoCompleta = (chamado) => {
  chamadoSelecionado.value = chamado
  dialogDescricao.value = true
}

// Busca dados da API
const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    const result = await chamadosStore.fetchChamados()

    if (!result.success) {
      throw new Error(result.message || 'Falha ao carregar chamados')
    }

    chamados.value = result.data || []
    lastUpdate.value = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (err) {
    error.value = err.message || 'Erro desconhecido'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
  intervalId = setInterval(fetchData, 180000) // 5 minutos
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.nowrap {
  flex-wrap: nowrap;
  overflow-x: auto; /* scroll horizontal se necessário */
}
.min-width-fit {
  min-width: fit-content;
}

.flex-grow {
  flex-grow: 1;
  padding: 0 8px; /* espaçamento lateral para respirar */
}

.dashboard-page {
  background: linear-gradient(135deg, #1C2B36 0%, #2C3E50 100%);
  min-height: 100vh;
  padding: 10px;
  /* border: 2px red solid; */
}

.container {
  max-width: 1800px;
  margin: 0 auto;
  /* border: 2px yellow solid; */
}

.header-section {
  margin-bottom: 14px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.loading-container {
  min-height: 200px;
}

.empty-state {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

.chamados-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.chamado-card {
  border-radius: 10px;
  background: #2d3748;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.25s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.chamado-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  background: #333f50;
}

.chamado-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.badge-local {
  background: linear-gradient(135deg, #FF6B35, #FF8E53);
  font-size: 0.75rem;
  max-width: 200px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chamado-descricao {
  min-height: 48px;
  display: flex;
  align-items: center;
}

.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.descricao-completa {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
}

.modal-completo {
  min-width: 90vw;
  max-width: 1000px;
}

/* Responsividade */
@media (max-width: 768px) {
  .dashboard-page {
    padding: 12px;
  }

  .header-section {
    padding: 12px;
  }

  .badge-local {
    font-size: 0.7rem;
    max-width: 140px;
  }

  .chamado-descricao {
    min-height: 40px;
  }

  .modal-completo {
    min-width: 95vw;
  }
}
</style>
