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
    <div class="row q-col-gutter-md q-mb-xl" v-if="!loading && meusChamados.length > 0">
      <div class="col-12">
        <q-card class="summary-card text-white shadow-3 rounded-borders">
          <q-card-section class="q-pa-lg">
            <div class="row items-center q-mb-lg">
              <q-icon name="analytics" size="md" class="q-mr-sm" />
              <div class="text-h6 text-weight-bold">Visão Geral</div>
            </div>

            <div class="row q-col-gutter-lg">
              <!-- Total -->
              <div class="col-6 col-sm-3 col-md-2 text-center border-right">
                <div class="text-caption text-uppercase opacity-70 q-mb-xs">Total</div>
                <div class="text-h3 text-weight-bolder">{{ meusChamados.length }}</div>
              </div>

              <!-- Stats Loop -->
              <div class="col-6 col-sm-3 col-md-2 text-center" v-for="stat in estatisticas" :key="stat.label">
                <div class="text-caption text-uppercase opacity-70 q-mb-xs">{{ stat.label }}</div>
                <div class="text-h4 text-weight-bold" :style="{ color: stat.color === 'white' || stat.color === '#ffffff' ? 'white' : 'white' }">
                  {{ stat.count }}
                </div>
                <!-- Pequena barra de cor para indicar o status visualmente -->
                <div class="q-mt-sm mx-auto" :style="{ backgroundColor: stat.rawColor, height: '4px', width: '20px', borderRadius: '2px', margin: '8px auto 0' }"></div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Grupos de Chamados por Status -->
    <div v-for="grupo in chamadosAgrupados" :key="grupo.statusId" class="q-mb-xl">
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
            :style="{ borderLeft: `5px solid ${getStatusColor(chamado.statusId)}` }"
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

              <div class="text-body2 text-grey-8 ellipsis-3-lines" style="min-height: 4.5em; line-height: 1.5;">
                {{ chamado.Description || chamado.descricao || 'Sem descrição disponível.' }}
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
import { onMounted, ref, computed } from 'vue'
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
    const statusId = chamado.statusId;
    if (!grupos[statusId]) {
      grupos[statusId] = {
        statusId: statusId,
        statusName: getStatusNome(statusId),
        color: getStatusColor(statusId),
        tickets: []
      };
    }
    grupos[statusId].tickets.push(chamado);
  });

  return Object.values(grupos).sort((a, b) => {
    const indexA = statusOrder.indexOf(a.statusId);
    const indexB = statusOrder.indexOf(b.statusId);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
});

const estatisticas = computed(() => {
  const stats = {};
  meusChamados.value.forEach(c => {
    const nome = getStatusNome(c.statusId);
    if (!stats[nome]) {
      stats[nome] = {
        label: nome,
        count: 0,
        color: 'white', // Texto sempre branco no card escuro
        rawColor: getStatusColor(c.statusId) // Cor original para a barra indicadora
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

onMounted(() => {
  carregarDados()
})
</script>

<style scoped>
.summary-card {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  transition: transform 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
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
