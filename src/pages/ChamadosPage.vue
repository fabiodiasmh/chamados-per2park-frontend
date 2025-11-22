<template>
  <q-page class="chamados-page q-pa-md">
    <div class="container">
      <!-- Header Compacto -->
      <div class="header-section q-mb-lg">
        <div class="text-subtitle1 text-weight-bold text-white column items-center">
          <span class="text-gradient text-h5 q-mb-xs">{{ chamadosFiltrados.length }} Chamados</span>
          <span class="text-caption text-grey-5">Atualizado: {{ lastUpdate }}</span>
        </div>
      </div>

      <div class="filtros-section q-mb-lg glass q-pa-md rounded-borders">
        <div class="row q-gutter-sm q-col-gutter-xs">
          <!-- Busca por número -->
          <q-input
            v-model="filtroNumeroChamado"
            dense
            outlined
            placeholder="Nº"
            class="col-12 col-sm-2"
            input-class="text-white"
            bg-color="transparent"
            color="primary"
          >
            <template v-slot:prepend>
              <q-icon name="tag" size="sm" color="grey-5" />
            </template>
          </q-input>

          <!-- Busca geral -->
          <q-input
            v-model="filtroTexto"
            dense
            outlined
            color="primary"
            placeholder="Local ou descrição..."
            class="col-12 col-sm"
            hide-bottom-space
            input-class="text-grey-9"
            bg-color="white"
          >  <template v-slot:prepend>
              <q-icon name="search" size="sm" color="grey-5" />
            </template>
          </q-input>

          <!-- Status (full width em mobile) -->
          <q-select
            v-model="filtroStatus"
            :options="opcoesStatus"
            dense
            outlined
            color="primary"
            emit-value
            map-options
            class="col-12 col-sm-4 col-md-3"
            hide-bottom-space
            input-class="text-grey-9"
            bg-color="white"
            options-cover
            popup-content-class="bg-white text-grey-9"
          />

          <!-- Ordenação -->
          <q-select
            v-model="ordenacao"
            :options="[
              { label: 'Recentes', value: 'recentes' },
              { label: 'Antigos', value: 'antigos' },
            ]"
            dense
            outlined
            color="primary"
            emit-value
            map-options
            class="col-12 col-sm-3 col-md-2"
            hide-bottom-space
            input-class="text-grey-9"
            bg-color="white"
            options-cover
            popup-content-class="bg-white text-grey-9"
          />

          <!-- Botões: agrupar em linha ou coluna em mobile -->
          <div class="q-gutter-xs justify-end q-mt-sm q-mt-sm-sm flex items-center">
            <q-btn
              dense
              flat
              round
              icon="refresh"
              color="white"
              @click="fetchData"
              :disable="loading"
              class="col-6 col-sm-auto hover-rotate"
            >
              <q-tooltip>Atualizar</q-tooltip>
            </q-btn>
            <q-btn
              dense
              flat
              round
              icon="clear"
              color="white"
              @click="limparFiltros"
              class="col-6 col-sm-auto hover-rotate"
            >
              <q-tooltip>Limpar filtros</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-container flex flex-center">
        <q-spinner-hourglass color="primary" size="3em" />
        <div class="q-mt-md text-subtitle1 text-grey-5">Carregando...</div>
      </div>

      <!-- Error -->
      <q-banner v-if="error" class="bg-negative text-white q-mb-md rounded-borders">
        <template v-slot:avatar>
          <q-icon name="error" color="white" size="sm" />
        </template>
        {{ error }}
        <template v-slot:action>
          <q-btn
            flat
            color="white"
            size="sm"
            label="Tentar novamente"
            @click="fetchData"
          />
        </template>
      </q-banner>

      <!-- Empty State -->
      <div
        v-if="!loading && !error && (!chamadosFiltrados || chamadosFiltrados.length === 0)"
        class="empty-state text-center q-py-xl"
      >
        <q-icon name="inbox" size="4em" color="grey-6" />
        <div class="text-subtitle1 text-grey-5 q-mt-md">
          Nenhum chamado encontrado
        </div>
      </div>

      <!-- Lista Compacta de Chamados -->
      <div
        v-if="!loading && !error && chamadosFiltrados && chamadosFiltrados.length > 0"
        class="chamados-list q-gutter-y-md"
      >
        <q-card
          v-for="chamado in chamadosFiltrados"
          :key="chamado.Id"
          class="chamado-card q-mb-md cursor-pointer"
          @click="mostrarDescricaoCompleta(chamado)"
          style="background: #2d3748; border-radius: 8px;"
        >
          <div class="row no-wrap">
            <!-- Borda Colorida Esquerda -->
            <div
              class="q-mr-md"
              :style="{
                width: '4px',
                backgroundColor: getStatusColor(chamado.Status),
                borderTopLeftRadius: '8px',
                borderBottomLeftRadius: '8px'
              }"
            ></div>

            <div class="col q-py-md q-pr-md">
              <!-- Linha 1: ID, Status e Data -->
              <div class="row items-center justify-between q-mb-xs">
                <div class="row items-center q-gutter-sm">
                  <span class="text-h6 text-grey-5">#{{ chamado.Id }}</span>
                  <q-badge
                    :style="{ backgroundColor: getStatusColor(chamado.Status) }"
                    :text-color="getStatusTextColor(chamado.Status)"
                    class="q-px-sm text-weight-bold"
                  >
                    {{ getStatusLabel(chamado.Status) }}
                  </q-badge>
                </div>
                <div class="text-caption text-grey-5">
                  {{ formatarData(chamado.OpeningDate) }}
                </div>
              </div>

              <!-- Linha 2: Local -->
              <div class="row items-center q-mb-sm">
                <q-icon name="place" color="blue" size="xs" class="q-mr-xs" />
                <span class="text-blue text-weight-bold">{{ chamado.Local?.Name || "Local não informado" }}</span>
              </div>

              <!-- Linha 3: Descrição -->
              <div class="text-body1 text-grey-5 q-mb-md line-clamp-2">
                {{ chamado.Description }}
              </div>

              <!-- Linha 4: Categoria e Usuário -->
              <div class="row items-center justify-between">
                <div class="row items-center text-grey-5">
                  <q-icon :name="chamado.Category?.Name === 'SITE' ? 'language' : 'computer'" size="xs" class="q-mr-xs" />
                  <span class="text-uppercase text-caption text-weight-bold">{{ chamado.Category?.Name || "—" }}</span>
                </div>
                <div class="row items-center text-grey-5">
                  <q-icon name="person" size="xs" class="q-mr-xs" />
                  <!-- <span class="text-uppercase text-caption text-weight-bold">{{ chamado.ContactName || "—" }}</span> -->
                   <span class="text-uppercase text-caption text-weight-bold">{{ chamado.User.Name || "—" }}</span>
                </div>
              </div>
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <chamado-detalhes-modal
      v-model="dialogDescricao"
      :chamado="chamadoSelecionado"
      @refresh="fetchData"
    />

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        v-show="showScrollTopButton"
        fab
        icon="arrow_upward"
        color="primary"
        @click="scrollToTop"
        class="shadow-4 bg-gradient-primary"
      />
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, watch, nextTick } from "vue";
import { useQuasar } from "quasar";
import { useChamadosStore } from "stores/chamados";
import { useAuthStore } from "stores/auth";
import { useRoute } from "vue-router";
import ChamadoDetalhesModal from "components/ChamadoDetalhesModal.vue";

const authStore = useAuthStore();
const chamadosStore = useChamadosStore();
const $q = useQuasar();
const route = useRoute();

const chamados = ref([]);
const detalhe_chamado = ref([]);
const loading = ref(true);
const error = ref(null);
const lastUpdate = ref("");
const dialogDescricao = ref(false);
const chamadoSelecionado = ref(null);
let intervalId = null;

// Filtros
const filtroTexto = ref("");
const filtroNumeroChamado = ref("");
const filtroStatus = ref(null);
const ordenacao = ref("recentes");

const savedScrollPosition = ref(0);
const showScrollTopButton = ref(false);

const handleScroll = () => {
  showScrollTopButton.value = window.scrollY > 400;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const limparFiltros = () => {
  filtroTexto.value = "";
  filtroStatus.value = null;
  ordenacao.value = "recentes";
  filtroNumeroChamado.value = "";
};

const opcoesStatus = [
  { label: "Todos", value: null },
  { label: "Abertos", value: 0 },
  { label: "Em análise", value: 1 },
  { label: "Em atendimento", value: 2 },
  { label: "Feedback", value: 8 },
  { label: "Nível 2", value: 12 },
  { label: "Nível 3", value: 10 },
  { label: "Aguardando resposta", value: 9 },
  { label: "Aguardando assistência", value: 11 },
  { label: "Fechado", value: 5 },
];

const getStatusLabel = (status) => {
  const map = {
    0: "Aberto",
    1: "Em análise",
    2: "Em atendimento",
    8: "Feedback",
    9: "Aguardando resposta",
    10: "Nível 3",
    11: "Aguardando assistência",
    12: "Nível 2",
    5: "Fechado",
  };
  return map[status] || "Desconhecido";
};

const getStatusColor = (status) => {
  const colors = {
    0: '#EF5350', // Aberto - Red
    1: '#FFEE58', // Em analise - Yellow
    2: '#FFA726', // Em atendimento - Orange
    8: '#42A5F5', // Feedback - Blue
    9: '#26A69A', // Aguardando resposta - Teal
    10: '#AB47BC', // Nivel 3 - Purple
    11: '#78909C', // Aguardando assistencia - Blue Grey
    12: '#5C6BC0', // Nivel 2 - Indigo
    5: '#00E676', // Fechado - Green
  };
  return colors[status] || '#9E9E9E';
};

const getStatusTextColor = (status) => {
  return status === 1 ? 'black' : 'white';
};

const formatarData = (dataString) => {
  if (!dataString) return "—";
  const data = new Date(dataString);
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await chamadosStore.fetchChamados(); // Ajuste conforme sua store
    if(res.success) {
        chamados.value = res.data || [];
        lastUpdate.value = new Date().toLocaleTimeString();
    } else {
        throw new Error(res.message);
    }
  } catch (err) {
    // error.value = err.message || "Erro ao carregar chamados";
    // Mock data for visualization if API fails or is not connected
    chamados.value = [
        {
          Id: 1234,
          OpeningDate: new Date().toISOString(),
          Status: 0,
          Local: { Name: 'Shopping Center' },
          Category: { Name: 'Hardware' },
          Description: 'Impressora não liga.',
          ContactName: 'João Silva',
          ContactMail: 'joao.silva@example.com',
          ContactPhone: '11987654321',
          Equipments: [{ Id: 1, Name: 'Impressora HP LaserJet' }],
          HistoryCalls: [
            {
              Date: new Date().toISOString(),
              Status: 0,
              Description: 'Chamado aberto pelo cliente',
              User: { Name: 'Sistema' }
            }
          ]
        },
        {
          Id: 1235,
          OpeningDate: new Date().toISOString(),
          Status: 2,
          Local: { Name: 'Estacionamento A' },
          Category: { Name: 'Rede' },
          Description: 'Sem conexão com internet.',
          ContactName: 'Maria Santos',
          ContactMail: 'maria.santos@example.com',
          ContactPhone: '11976543210',
          Equipments: [{ Id: 2, Name: 'Switch Cisco' }],
          HistoryCalls: [
            {
              Date: new Date(Date.now() - 3600000).toISOString(),
              Status: 0,
              Description: 'Chamado aberto',
              User: { Name: 'Sistema' }
            },
            {
              Date: new Date().toISOString(),
              Status: 2,
              Description: 'Técnico a caminho',
              User: { Name: 'Carlos Técnico' }
            }
          ]
        },
        {
          Id: 1236,
          OpeningDate: new Date().toISOString(),
          Status: 5,
          Local: { Name: 'Guarita 1' },
          Category: { Name: 'Software' },
          Description: 'Erro no sistema.',
          ContactName: 'Pedro Oliveira',
          ContactMail: 'pedro.oliveira@example.com',
          ContactPhone: '11965432109',
          Equipments: [],
          HistoryCalls: []
        }
    ];
  } finally {
    loading.value = false;
  }
};

const chamadosFiltrados = computed(() => {
  let lista = [...chamados.value];

  if (filtroNumeroChamado.value) {
    lista = lista.filter((c) => c.Id.toString().includes(filtroNumeroChamado.value));
  }

  if (filtroTexto.value) {
    const termo = filtroTexto.value.toLowerCase();
    lista = lista.filter(
      (c) =>
        (c.Local?.Name && c.Local.Name.toLowerCase().includes(termo)) ||
        (c.Description && c.Description.toLowerCase().includes(termo))
    );
  }

  if (filtroStatus.value !== null) {
    lista = lista.filter((c) => c.Status === filtroStatus.value);
  }

  if (ordenacao.value === "recentes") {
    lista.sort((a, b) => new Date(b.OpeningDate) - new Date(a.OpeningDate));
  } else {
    lista.sort((a, b) => new Date(a.OpeningDate) - new Date(b.OpeningDate));
  }

  return lista;
});

const mostrarDescricaoCompleta = async (chamado) => {
  // Salva a posição do scroll ANTES de qualquer coisa
  savedScrollPosition.value = window.scrollY;
  loading.value = true;

  try {
    // Busca os detalhes completos do chamado
    const result = await chamadosStore.fetchDetalheChamados(chamado.Id);

    if (result.success) {
      // Usa os dados completos retornados pela API
      chamadoSelecionado.value = result.data || chamado;
      console.log('Chamado completo carregado:', chamadoSelecionado.value);
    } else {
      // Fallback para os dados básicos se a API falhar
      chamadoSelecionado.value = chamado;
      console.warn('Usando dados básicos do chamado');
    }

    // Abre o modal depois que tudo foi carregado
    dialogDescricao.value = true;
  } catch (err) {
    console.error('Erro ao carregar detalhes:', err);
    // Em caso de erro, usa os dados básicos
    chamadoSelecionado.value = chamado;
    dialogDescricao.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
  window.addEventListener("scroll", handleScroll);
  if (route.query.status) {
      filtroStatus.value = parseInt(route.query.status);
  }
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.chamados-page {
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.chamado-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}

.chamado-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.hover-rotate:hover .q-icon {
  transform: rotate(90deg);
  transition: transform 0.3s ease;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.glass-blur {
  backdrop-filter: blur(10px);
  background: rgba(30, 30, 46, 0.9) !important;
}

.border-bottom-light {
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.border-light {
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
}

.bg-surface-light {
    background: rgba(255,255,255,0.05);
}

.container-limit {
    max-width: 1000px;
    margin: 0 auto;
}

.hover-underline:hover {
    text-decoration: underline;
}

/* Timeline styling for dark theme */
/* .timeline-entry :deep(.q-timeline__title) {
    color: #000000 !important;

}

.timeline-entry :deep(.q-timeline__subtitle) {
    color: #000000 !important;
}

.timeline-entry :deep(.q-timeline__dot) {
    background: var(--q-primary) !important;
} */

.timeline-entry-compact .q-timeline__title,
.timeline-entry-compact .q-timeline__subtitle {
  color: black !important;
}


/* Backdrop blur effect for dialog */
/* Backdrop blur effect for dialog */
.backdrop-blur :deep(.q-dialog__backdrop) {
    backdrop-filter: blur(10px);
    background: rgba(0, 0, 0, 0.4) !important;
}

/* Info card styling for modal sections */
.info-card {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
}

.info-card:hover {
    background: rgba(255, 255, 255, 0.09);
    border-color: rgba(255, 255, 255, 0.15);
}

/* White theme info cards */
.info-card-white {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius:  10px;
    transition: all 0.3s ease;
}

.info-card-white:hover {
    background: #ffffff;
    border-color: #bdbdbd;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

</style>


