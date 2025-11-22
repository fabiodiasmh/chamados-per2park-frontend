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

    <q-dialog v-model="dialogDescricao" transition-show="scale" transition-hide="scale" class="backdrop-blur">
      <q-card style="max-width: 1100px; width: 92vw; max-height: 92vh; background: #ffffff; border-radius: 20px; box-shadow: 0 12px 40px rgba(0,0,0,0.3);">
        <!-- Cabeçalho -->
        <q-card-section class="row items-center q-pb-sm q-pt-md" style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);">
          <q-icon name="support_agent" color="white" size="md" class="q-mr-sm" />
          <div class="text-h5 text-white">Chamado #{{ chamadoSelecionado?.Id }}</div>
          <q-space />
          <q-btn flat round dense icon="content_copy" @click="copiarChamado" size="sm" color="white" />
          <q-btn flat round dense icon="close" v-close-popup size="sm" color="white" />
        </q-card-section>

        <q-separator color="white" style="opacity: 0.1;" />

        <q-card-section class="q-pa-lg scroll" style="max-height: calc(92vh - 160px);">
          <div class="row q-col-gutter-lg">
            <!-- Info Principal: Local e Consulta SAT lado a lado -->
            <div class="col-12">
              <div class="row q-col-gutter-md">
                <!-- Local -->
                <!-- Local -->
                <div class="col-12 col-md-6">
                  <div class="info-card-white q-pa-md rounded-borders" style="min-height: 120px; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                      <div class="row items-center q-gutter-sm q-mb-sm">
                        <q-icon name="place" color="orange" size="sm" />
                        <div class="text-caption text-grey-9">Local</div>
                      </div>
                      <div class="text-body1 text-weight-medium text-grey-10">{{ chamadoSelecionado?.Local?.Name || "—" }}</div>
                    </div>

                    <div class="row items-center q-gutter-md q-mt-sm">
                      <div class="row items-center text-grey-9">
                         <q-icon name="schedule" size="xs" class="q-mr-xs" />
                         <span class="text-caption">{{ formatarData(chamadoSelecionado?.OpeningDate) }}</span>
                      </div>
                      <q-badge :style="{ backgroundColor: getStatusColor(chamadoSelecionado?.Status) }" :text-color="getStatusTextColor(chamadoSelecionado?.Status)">
                        {{ getStatusLabel(chamadoSelecionado?.Status) }}
                      </q-badge>
                    </div>
                  </div>
                </div>

                <!-- Consulta SAT -->
                <div class="col-12 col-md-6">
                  <div class=" q-pa-md rounded-borders" style="min-height: 120px; display: flex; flex-direction: column;">
                    <div class="row items-center q-gutter-sm q-mb-sm">
                      <q-icon name="qr_code_scanner" color="indigo" size="sm" />
                      <div class="text-caption text-grey-9">Consultar SAT</div>
                    </div>
                    <div class="row items-center q-gutter-sm">
                      <q-input
                        v-model="valor_numero_serie"
                        outlined
                        dense
                        placeholder="Número de série"
                        class="col"
                        bg-color="white"
                        color="indigo"
                        @keyup.enter="buscar_SAT"
                      >
                        <template v-slot:prepend>
                          <q-icon name="search" color="grey-6" size="sm" />
                        </template>
                      </q-input>
                      <q-btn
                        color="indigo"
                        icon="check_circle"
                        label="Verificar"
                        @click="buscar_SAT"
                        :loading="loadingSAT"
                        unelevated
                        dense
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contato: Nome, Email e Telefone em linha única -->
            <div class="col-12">
              <div class="info-card-white q-pa-md rounded-borders">
                <div class="row items-center q-gutter-md">
                  <div class="row items-center q-gutter-xs">
                    <q-icon name="person" color="purple" size="sm" />
                    <span class="text-caption text-grey-9">Nome:</span>
                    <span class="text-body2 text-weight-medium text-grey-10">{{ chamadoSelecionado?.ContactName || "—" }}</span>
                  </div>
                  <q-separator vertical />
                  <div class="row items-center q-gutter-xs">
                    <q-icon name="email" color="teal" size="sm" />
                    <span class="text-caption text-grey-9">E-mail:</span>
                    <span class="text-body2 text-grey-10">{{ chamadoSelecionado?.ContactMail || "—" }}</span>
                  </div>
                  <q-separator vertical />
                  <div class="row items-center q-gutter-xs">
                    <q-icon name="phone" color="green" size="sm" />
                    <span class="text-caption text-grey-9">Telefone:</span>
                    <a v-if="chamadoSelecionado?.ContactPhone" @click.prevent="abrirWhatsApp(chamadoSelecionado.ContactPhone)" class="cursor-pointer text-positive text-body2 text-weight-medium">
                      <q-icon name="fab fa-whatsapp" size="sm" class="q-mr-xs" />
                      {{ chamadoSelecionado.ContactPhone }}
                    </a>
                    <span v-else class="text-body2 text-grey-10">—</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Descrição com fonte maior -->
            <div class="col-12">
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-icon name="description" color="amber-8" size="md" />
                <div class="text-h6 text-grey-10">Descrição do Problema</div>
              </div>
              <div class="q-pa-lg rounded-borders text-body1" style="background: #f5f5f5; border-left: 4px solid #FFA726; white-space: pre-wrap; font-size: 16px; line-height: 1.7; color: #212121;">
                {{ chamadoSelecionado?.Description || "Sem descrição" }}
              </div>
            </div>

            <!-- Equipamentos (se houver) -->
            <div class="col-12" v-if="chamadoSelecionado?.Equipments?.length">
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-icon name="devices" color="cyan" size="md" />
                <div class="text-h6 text-grey-10">Equipamentos</div>
              </div>
              <div class="row q-gutter-xs info-card-white q-pa-sm rounded-borders">
                <q-chip
                  v-for="equip in chamadoSelecionado.Equipments"
                  :key="equip.Id"
                  dense
                  size="sm"
                  icon="router"
                  color="secondary"
                  text-color="white"
                >
                  {{ equip.Name }}
                </q-chip>
              </div>
            </div>

            <!-- Histórico (se houver) -->
            <div class="col-12" v-if="chamadoSelecionado?.HistoryCalls && chamadoSelecionado.HistoryCalls.length > 0">
              <!-- <div class="row items-center q-gutter-sm q-mb-sm">
                <q-icon name="history" color="teal" size="md" />
                <div class="text-subtitle2 text-grey-10">Histórico de Atendimento</div>
              </div> -->
              <div class="info-card q-pa-sm rounded-borders">
                <q-timeline color="primary" layout="dense" side="right">
             <q-timeline-entry
  v-for="(hist, index) in chamadoSelecionado.HistoryCalls"
  :key="index"
  icon="chat"
  class="timeline-entry-compact"
>
  <!-- Título -->
  <template #title>
    <div class="text-black text-weight-medium">
      {{ hist.User?.Name || 'Sistema' }}
    </div>
  </template>

  <!-- Subtítulo -->
  <template #subtitle>
    <div class="text-black">
      {{ formatarData(hist.Date) }}
    </div>
  </template>

  <!-- Conteúdo -->
  <div class="text-caption text-secondary">{{ getStatusLabel(hist.Status) }}</div>
  <div class="text-body2 text-grey-10">{{ hist.Description }}</div>
</q-timeline-entry>

                </q-timeline>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator color="black" style="opacity: 0.1;" />

        <!-- Rodapé com Ações -->
        <q-card-actions class="q-pa-md row q-gutter-sm" style="background: white;">
          <q-btn
            v-if="chamadoSelecionado?.Status == 0"
            color="primary"
            icon="play_arrow"
            label="Atender"
            @click="abrirPromptAtualizacao(2, 'Iniciar atendimento', saudacao() + ' o chamado foi recepcionado e está na fila de atendimento.')"
            unelevated
            class="col"
          />
          <q-btn
            color="primary"
            icon="reply"
            label="Responder"
            @click="abrirPromptAtualizacao(9, 'Resposta', '')"
            unelevated
            class="col"
          />
          <q-btn
            color="positive"
            icon="check_circle"
            label="Finalizar"
            @click="abrirPromptAtualizacao(5, 'Chamado resolvido', 'Chamado encerrado.')"
            unelevated
            class="col"
          />
          <q-btn-dropdown
            color="grey-7"
            label="Mais"
            icon="more_horiz"
            unelevated
            class="col"
            dropdown-icon="expand_more"
          >
            <q-list class="bg-dark text-white">
              <q-item clickable @click="abrirPromptAtualizacao(9, 'Pedir evidência', 'Favor encaminhar a evidência.')">
                <q-item-section avatar><q-icon name="camera_alt" color="blue-grey" /></q-item-section>
                <q-item-section>Pedir Evidência</q-item-section>
              </q-item>
              <q-item clickable @click="abrirPromptAtualizacao(9, 'Pedir validação', 'Favor verificar e validar.')">
                <q-item-section avatar><q-icon name="fact_check" color="deep-purple" /></q-item-section>
                <q-item-section>Pedir Validação</q-item-section>
              </q-item>
              <q-item clickable @click="abrirPromptAtualizacao(9, 'Solicitar número de série', 'Solicito o número de série do(s) equipamento(s).')">
                <q-item-section avatar><q-icon name="qr_code" color="indigo" /></q-item-section>
                <q-item-section>Solicitar Nº Série</q-item-section>
              </q-item>
              <q-separator dark />
              <q-item clickable @click="abrirPromptAtualizacao(11, 'Assistência Técnica', 'Encaminhado para assistência técnica.')">
                <q-item-section avatar><q-icon name="build" color="red" /></q-item-section>
                <q-item-section>Assistência Técnica</q-item-section>
              </q-item>
              <q-item clickable @click="abrirPromptAtualizacao(12, 'Nível 2', 'Chamado encaminhado para nível 2.')">
                <q-item-section avatar><q-icon name="engineering" color="orange" /></q-item-section>
                <q-item-section>Encaminhar Nível 2</q-item-section>
              </q-item>
              <q-item clickable @click="abrirPromptAtualizacao(10, 'Nível 3', 'Chamado encaminhado para nível 3.')">
                <q-item-section avatar><q-icon name="precision_manufacturing" color="brown" /></q-item-section>
                <q-item-section>Encaminhar Nível 3</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-card-actions>
      </q-card>
    </q-dialog>

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

const valor_numero_serie = ref("");
const valor_saida_sat = ref(null);

// Filtros
const filtroTexto = ref("");
const filtroNumeroChamado = ref("");
const filtroStatus = ref(null);
const ordenacao = ref("recentes");

const savedScrollPosition = ref(0);
const showScrollTopButton = ref(false);
const loadingSAT = ref(false);

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

const getIconForHistory = (status) => {
    return 'chat_bubble_outline';
}

function copiarChamado() {
  const texto = `Chamado: ${chamadoSelecionado.value?.Id} - ${
    chamadoSelecionado.value?.Local?.Name || "Local não informado"
  }`;
  navigator.clipboard.writeText(texto);
  $q.notify({
    message: "Copiado!",
    color: "positive",
    position: "top",
    timeout: 1000
  });
}

const formatarNumeroWhatsApp = (numero) => {
  if (!numero) return "";
  let soNumeros = numero.replace(/\D/g, "");
  if (soNumeros.startsWith("0")) soNumeros = soNumeros.substring(1);
  if (!soNumeros.startsWith("55")) soNumeros = "55" + soNumeros;
  return soNumeros;
};

const abrirWhatsApp = (numero) => {
    const num = formatarNumeroWhatsApp(numero);
    if(num) window.open(`https://wa.me/${num}`, '_blank');
}

const buscar_SAT = async () => {
  loadingSAT.value = true;
  valor_numero_serie.value = valor_numero_serie.value?.trim() || "";
  const numeroLimpo = valor_numero_serie.value;

  try {
    if (!numeroLimpo) {
      $q.notify({ type: 'warning', message: 'Informe um número de série.' });
      return;
    }

    const respostaSAT = await chamadosStore.satSerie(numeroLimpo);

    if (respostaSAT.data.length === 0) {
      $q.notify({ type: 'negative', message: 'Número de série não encontrado!' });
    } else if (respostaSAT.data.length > 1) {
      $q.notify({ type: 'warning', message: 'Múltiplos SATs encontrados.' });
      valor_numero_serie.value = "";
    } else {
      const w = respostaSAT.data[0];
      valor_saida_sat.value = w;
      $q.dialog({
          title: "SAT Encontrado",
          message: `Cliente: ${w.cliente.nomeFantasia}\nLocal: ${w.localAtendimento.nomeLocal}\nEquipamento: ${w.equipamento.codEEquip}`,
          dark: true
      });
    }
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Erro ao buscar SAT.' });
  } finally {
    loadingSAT.value = false;
  }
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

const saudacao = () => {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia,";
  if (hora < 18) return "Boa tarde,";
  return "Boa noite,";
};

const abrirPromptAtualizacao = (novoStatus, placeholderTexto, texto) => {
  $q.dialog({
    title: placeholderTexto,
    prompt: {
      model: texto,
      counter: true,
      maxlength: "400",
      outlined: true,
      label: "Descrição",
      type: "textarea",
      isValid: (val) => val && val.trim().length > 0,
    },
    cancel: true,
    ok: "Confirmar",
    cancel: "Cancelar",
    class: 'white-dialog',
    style: 'background: white; color: black;',
    cardStyle: 'background: white; color: black;',
  }).onOk(async (descricao) => {
    await atualizarStatusChamado(novoStatus, descricao.trim());
  });
};

const atualizarStatusChamado = async (novoStatus, descricao) => {
  if (!chamadoSelecionado.value?.Id) return;

  loading.value = true;

  try {
    // 1. Atualiza o status no backend (ou store)
    const result = await chamadosStore.atualizarStatusNoStore(novoStatus, descricao);

    $q.notify({
      position: 'top',
      color: 'positive',
      message: 'Atualizado!',
      icon: 'check',
    });

    // 2. RECARREGA OS DETALHES COMPLETOS DO CHAMADO (inclui novo histórico)
    const detalhesResult = await chamadosStore.fetchDetalheChamados(chamadoSelecionado.value.Id);

    if (detalhesResult.success) {
      // 3. Atualiza o objeto reativo SEM fechar o modal
      chamadoSelecionado.value = detalhesResult.data;
    }

    const dados = {
      chamadoId: chamadoSelecionado.value.Id,
      status: novoStatus,
      email: authStore.usuario.User.Login,
      usuario: { id: authStore.usuario.User.Id }
    };

    try {
      await chamadosStore.meus_chamados(dados);
    } catch (error) {
      console.error('Erro ao registrar em meus_chamados:', error);
    }

  } catch (err) {
    $q.notify({
      position: 'top',
      color: 'negative',
      message: 'Erro ao atualizar chamado: ' + (err.message || 'tente novamente'),
      icon: 'error',
    });
  } finally {
    loading.value = false;
    // Atualiza também a lista principal
    await fetchData();
  }
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
          Equipments: [{ Id: 3, Name: 'Computador Dell' }],
          HistoryCalls: [
            {
              Date: new Date(Date.now() - 7200000).toISOString(),
              Status: 0,
              Description: 'Chamado aberto',
              User: { Name: 'Sistema' }
            },
            {
              Date: new Date(Date.now() - 3600000).toISOString(),
              Status: 2,
              Description: 'Em atendimento',
              User: { Name: 'Ana Suporte' }
            },
            {
              Date: new Date().toISOString(),
              Status: 5,
              Description: 'Problema resolvido. Sistema atualizado.',
              User: { Name: 'Ana Suporte' }
            }
          ]
        },
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


