<template>
  <q-page padding class="bg-grey-1">

    <!-- Título -->
    <div class="text-h5 text-weight-bold q-mb-md text-grey-9">
      Meus Chamados
    </div>

    <!-- Loading -->
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>

    <!-- Sem chamados -->
    <div v-if="!loading && meusChamados.length === 0" class="text-center text-grey-7 q-mt-xl">
      <q-icon name="assignment_late" size="4em" color="grey-4" />
      <div class="text-h6 q-mt-md">Nenhum chamado encontrado.</div>
    </div>

    <!-- Resumo / Estatísticas -->
    <div class="row q-mb-xl justify-center" v-if="!loading && meusChamados.length > 0">
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="bg-white text-grey-9 shadow-2 rounded-borders overflow-hidden">
          <q-card-section class="bg-grey-1 q-pa-md border-bottom">
            <div class="row items-center justify-between">
              <div class="row items-center">
                <q-icon name="analytics" size="sm" class="q-mr-sm text-primary" />
                <div class="text-subtitle1 text-weight-bold">Resumo dos Chamados</div>
              </div>
              <div class="text-subtitle2 text-grey-7">
                Total: <span class="text-primary text-weight-bolder text-h6">{{ meusChamados.length }}</span>
              </div>
            </div>
          </q-card-section>

          <q-list separator>
            <q-item v-for="stat in estatisticas" :key="stat.label" class="q-py-md hover-bg-grey-1">
              <q-item-section avatar>
                <q-avatar :style="{ backgroundColor: stat.rawColor + '20', color: stat.rawColor }" size="md" font-size="1.2rem">
                  <q-icon :name="getIconForStatus(stat.label)" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium text-grey-9">{{ stat.label }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row items-center">
                  <q-badge :style="{ backgroundColor: stat.rawColor }" text-color="white" rounded class="q-px-sm text-weight-bold">
                    {{ stat.count }}
                  </q-badge>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>

    <!-- Grupos de Chamados por Status -->
    <div v-for="grupo in chamadosAgrupados" :key="grupo.Status" class="q-mb-xl">
      <div class="row items-center q-mb-md">
        <div class="text-h6 text-bold text-grey-9 q-mr-md">
          {{ grupo.statusName }}
        </div>
        <q-badge :style="{ backgroundColor: grupo.color }" text-color="white" rounded class="q-px-sm text-weight-bold shadow-1">
          {{ grupo.tickets.length }}
        </q-badge>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="chamado in grupo.tickets" :key="chamado.chamadoId">
          <q-card
            class="ticket-card bg-white shadow-1 rounded-borders cursor-pointer"
            :style="{ borderLeft: `5px solid ${getStatusColor(chamado.Status || chamado.statusId)}` }"
            @click="abrirDetalhes(chamado)"
          >
            <q-card-section class="q-pa-md">
              <div class="row justify-between items-start q-mb-sm">
                <div class="text-subtitle1 text-weight-bolder text-grey-9">
                  #{{ chamado.chamadoId }}
                </div>
                <div class="text-caption text-grey-6 row items-center">
                  <q-icon name="schedule" size="xs" class="q-mr-xs" />
                  {{ formatDate(chamado.dataCriacao) }}
                </div>
              </div>

              <!-- Local -->
              <div class="row items-center q-mb-sm" v-if="chamado.Local?.Name">
                <q-icon name="place" size="xs" color="primary" class="q-mr-xs" />
                <div class="text-caption text-grey-8 text-weight-bold">
                  {{ chamado.Local.Name }}
                </div>
              </div>

              <div class="text-body2 text-grey-8 ellipsis-3-lines" style="min-height: 4.5em; line-height: 1.5;">
                {{ chamado.Description || chamado.descricao || '' }}
              </div>
            </q-card-section>

            <q-separator color="grey-2" />

            <q-card-actions align="right" class="q-pa-sm bg-grey-1">
              <q-btn
                flat
                dense
                size="sm"
                color="primary"
                icon-right="arrow_forward"
                label="Detalhes"
                class="text-weight-bold"
                @click.stop="abrirDetalhes(chamado)"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>

    <!-- MODAL REUTILIZÁVEL -->
    <chamado-detalhes-modal
      v-model="modal"
      :chamado="chamadoSelecionado"
      @refresh="carregarDados"
    />

  </q-page>
</template>

<script setup>
import { onMounted, ref, computed,watch } from 'vue'
import { useChamadosStore } from 'stores/chamados'
import { date } from 'quasar'
import ChamadoDetalhesModal from 'components/ChamadoDetalhesModal.vue'

const store = useChamadosStore()

const meusChamados = ref([])
const loading = ref(false)




// Ordem de exibição dos status
const statusOrder = [0, 1, 2, 8, 9, 11, 12, 10, 6, 5];

const chamadosAgrupados = computed(() => {
  const grupos = {};

  meusChamados.value.forEach(chamado => {
    const statusId = chamado.Status || chamado.statusId;
    if (!grupos[statusId]) {
      grupos[statusId] = {
        Status: statusId,
        statusName: getStatusNome(statusId),
        color: getStatusColor(statusId),
        tickets: []
      };
    }
    grupos[statusId].tickets.push(chamado);
  });

  return Object.values(grupos).sort((a, b) => {
    const indexA = statusOrder.indexOf(a.Status);
    const indexB = statusOrder.indexOf(b.Status);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
});

const estatisticas = computed(() => {
  const stats = {};
  meusChamados.value.forEach(c => {
    const nome = getStatusNome(c.Status || c.statusId);
    if (!stats[nome]) {
      stats[nome] = {
        label: nome,
        count: 0,
        color: 'white', // Texto sempre branco no card escuro
        rawColor: getStatusColor(c.Status || c.statusId) // Cor original para a barra indicadora
      };
    }
    stats[nome].count++;
  });
  return Object.values(stats);
});

const modal = ref(false)
const chamadoSelecionado = ref(null)

async function abrirDetalhes(chamado) {
  loading.value = true
  try {
    const res = await store.fetchDetalheChamados(chamado.chamadoId || chamado.Id)
    if (res.success) {
      chamadoSelecionado.value = res.data
    } else {
      chamadoSelecionado.value = chamado
    }
  } catch (e) {
    console.error('Erro ao carregar detalhes', e)
    chamadoSelecionado.value = chamado
  } finally {
    loading.value = false
    modal.value = true


}
}

watch(modal, async (isOpen) => {
  // Quando o modal FECHAR (false)
  if (!isOpen) {
    await store.fetchChamados()
    await carregarDados()
  }
})

function formatDate(d) {
  if (!d) return ''
  return date.formatDate(d, 'DD/MM/YYYY HH:mm')
}

function getStatusNome(statusId) {
  const map = {
    0: 'Aberto',
    1: 'Em Análise',
    2: 'Em Atendimento',
    5: 'Fechado',
    6: 'Reaberto',
    8: 'Aguardando Feedback',
    9: 'Aguardando Resposta',
    10: 'Encaminhado N3',
    11: 'Assistencia Técnica',
    12: 'Encaminhado N2'
  }
  return map[statusId] || `Status ${statusId}`
}

function getStatusColor(statusId) {
  const map = {
    0: '#ef5350', // red-400
    1: '#ffca28', // amber-400
    2: '#ffa726', // orange-400
    5: '#212121', // grey-900 (black)
    6: '#ab47bc', // purple-400
    8: '#42a5f5', // blue-400
    9: '#26a69a', // teal-400
    10: '#7e57c2', // deep-purple-400
    11: '#78909c', // blue-grey-400
    12: '#5c6bc0'  // indigo-400
  }
  return map[statusId] || '#9e9e9e'
}

async function carregarDados() {
  loading.value = true
  const res = await store.carregarChamados()
  if (res.success) {
    meusChamados.value = store.meusChamados
  }
  loading.value = false
}

function getIconForStatus(label) {
  const icons = {
    'Aberto': 'error_outline',
    'Em Análise': 'search',
    'Em Atendimento': 'engineering',
    'Fechado': 'check_circle',
    'Reaberto': 'replay',
    'Aguardando Feedback': 'feedback',
    'Aguardando Resposta': 'pending',
    'Encaminhado N3': 'dns',
    'Assistencia Técnica': 'build',
    'Encaminhado N2': 'computer'
  }
  return icons[label] || 'circle'
}

onMounted(() => {
  store.fetchChamados()
  carregarDados()
})
</script>

<style scoped>
.hover-bg-grey-1:hover {
  background-color: #f5f5f5;
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

.ticket-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.ticket-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
}

.border-right {
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.opacity-70 {
  opacity: 0.7;
}

/* Responsividade para a borda do resumo */
@media (max-width: 599px) {
  .border-right {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 16px;
    margin-bottom: 16px;
  }
}
</style>

<style scoped>
.hover-scale:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.transition-all {
  transition: all 0.2s ease;
}
</style>
