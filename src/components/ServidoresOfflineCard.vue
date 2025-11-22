<!-- src/components/ServidoresOfflineCard.vue -->
<template>
  <q-card class="glass half-width">
    <q-card-section class="text-center">
      <div class="text-h6 text-white">Servidores Offline</div>
    </q-card-section>

    <!-- Container com scroll vertical e sem scroll horizontal -->
    <q-card-section
      class="q-pa-none"
      style="max-height: 400px; overflow-y: auto; overflow-x: hidden;"
    >
      <q-table
        :rows="servidoresOffline"
        :columns="columns"
        row-key="id"
        :pagination="{ rowsPerPage: 0 }"
        hide-pagination
        bordered
        dense
        flat
        :no-data-label="'Nenhum servidor offline encontrado.'"
        :no-results-label="'Nenhum resultado encontrado.'"
        class="bg-transparent text-white"
        table-style="table-layout: fixed; width: 100%;"
        card-class="bg-transparent"
      >
        <!-- Coluna Cliente -->
        <template v-slot:body-cell-ClientName="props">
          <q-td :props="props" class="text-wrap" style="max-width: 250px;">
            {{ props.row.ClientName }} - {{ props.row.Name }}
          </q-td>
        </template>

        <!-- Coluna Data Último Upload -->
        <template v-slot:body-cell-UploadDate="props">
          <q-td :props="props" class="text-wrap">
            <div>
              {{ formatDate(props.row.UploadDate) }}
              <div
                v-if="isOffline(props.row.UploadDate)"
                class="text-red-4 text-caption"
              >
                Offline há {{ getElapsedTime(props.row.UploadDate) }}
              </div>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed,onMounted,onUnmounted } from 'vue'
import { date } from 'quasar'
import { useMonitorServerStore } from 'stores/monitoramentoServidor'

const store = useMonitorServerStore()

// Acessa diretamente o estado do store
const todasUnidades = computed(() => store.todas_unidades || [])

const columns = [
  { name: 'ClientName', label: 'Cliente', field: 'ClientName', align: 'left', sortable: true },
  // { name: 'Name', label: 'Unidade', field: 'Name', align: 'left', sortable: true },
  { name: 'UploadDate', label: 'Data Último Upload', field: 'UploadDate', align: 'left', sortable: true }
]

const servidoresOffline = computed(() => {
  const dezMinutosAtras = new Date()
  dezMinutosAtras.setMinutes(dezMinutosAtras.getMinutes() - 10)

  return todasUnidades.value.filter(item => {
    if (item.Status !== 0) return false
    const uploadDate = new Date(item.UploadDate)
    return uploadDate < dezMinutosAtras
  })
   .sort((a, b) => {
      // Ordena do mais recente (menos tempo offline) para o mais antigo
      return new Date(b.UploadDate) - new Date(a.UploadDate)
    })
})

// --- Funções auxiliares ---
const formatDate = (isoString) => {
  if (!isoString) return '—'
  return date.formatDate(isoString, 'DD/MM/YYYY HH:mm:ss')
}

const isOffline = (isoString) => {
  if (!isoString) return false
  const now = new Date()
  const past = new Date(isoString)
  const diffMinutes = (now - past) / 60000
  return diffMinutes > 10
}

const getElapsedTime = (isoString) => {
  if (!isoString) return '—'
  const now = new Date()
  const past = new Date(isoString)
  const diffMs = now - past
  const diffMinutes = Math.floor(diffMs / 60000)

  const days = Math.floor(diffMinutes / 1440)
  const hours = Math.floor((diffMinutes % 1440) / 60)
  const minutes = diffMinutes % 60

  if (days > 0) return `${days}d ${hours}h ${minutes}min`
  if (hours > 0) return `${hours}h ${minutes}min`
  return `${minutes} min`
}
</script>

<style scoped>
/* Força quebra de linha e evita overflow horizontal */
.q-table tbody td {
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

/* Estiliza cabeçalho para melhor contraste */
:deep(.q-table thead th) {
  font-weight: bold;
  text-align: left;
  background-color: rgba(255, 255, 255, 0.08);
  color: white;
}

/* ⬇️ AJUSTE DE PADDING MENOR (denser que dense!) ⬇️ */
:deep(.q-table .q-td),
:deep(.q-table .q-th) {
  padding: 4px 8px !important;
}

/* Opcional: define altura mínima para linhas */
:deep(.q-table tbody tr) {
  min-height: 36px;
}

/* Remove borda superior da primeira linha para ficar mais limpo */
:deep(.q-table tbody tr:first-child td) {
  border-top: none;
}
</style>
