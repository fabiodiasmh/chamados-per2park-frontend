<template>
  <q-page class="dashboard-page">
    <div class="container">
      <!-- Header Compacto -->

      <div class="text-subtitle1 text-weight text-white column items-center">
        {{ chamadosFiltrados.length }} chamados • Atualizado: {{ lastUpdate }}
      </div>
      <div class="filtros-section q-mb-md">
        <div class="row q-gutter-sm q-col-gutter-xs">
          <!-- Busca por número -->
          <q-input
            v-model="filtroNumeroChamado"
            dense
            outlined
            placeholder="Nº"
            class="col-12 col-sm-2"
            input-class="text-white"
            bg-color="dark"
            type="text"
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
            dark
            color="blue-4"
            placeholder="Local ou descrição..."
            class="col-12 col-sm"
            input-class="text-white"
            bg-color="dark"
          >
            <template v-slot:prepend>
              <q-icon name="search" size="sm" color="grey-5" />
            </template>
          </q-input>

          <!-- Status (full width em mobile) -->
          <q-select
            v-model="filtroStatus"
            :options="opcoesStatus"
            dense
            outlined
            dark
            color="blue-4"
            emit-value
            map-options
            class="col-12 col-sm-4 col-md-3"
            input-class="text-white"
            bg-color="dark"
            options-dark
            popup-content-class="bg-dark text-white"
            hide-bottom-space
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
            dark
            color="blue-4"
            emit-value
            map-options
            class="col-12 col-sm-3 col-md-2"
            input-class="text-white"
            bg-color="dark"
            options-dark
            popup-content-class="bg-dark text-white"
            hide-bottom-space
          />

          <!-- Botões: agrupar em linha ou coluna em mobile -->
          <div class="q-gutter-xs justify-end q-mt-sm q-mt-sm-sm">
            <q-btn
              dense
              flat
              icon="refresh"
              color="grey-5"
              @click="fetchData"
              :disable="loading"
              size="sm"
              class="col-6 col-sm-auto"
            >
              <q-tooltip>Atualizar</q-tooltip>
            </q-btn>
            <q-btn
              dense
              flat
              icon="clear"
              color="grey-5"
              @click="limparFiltros"
              size="sm"
              class="col-6 col-sm-auto"
            >
              <q-tooltip>Limpar filtros</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Filtros -->

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
        v-if="
          !loading &&
          !error &&
          (!chamadosFiltrados || chamadosFiltrados.length === 0)
        "
        class="empty-state text-center q-py-xl"
      >
        <q-icon name="inbox" size="4em" color="grey-5" />
        <div class="text-subtitle1 text-grey-5 q-mt-md">
          Nenhum chamado aberto no momento
        </div>
      </div>

      <!-- Lista Compacta de Chamados -->
      <div
        v-if="
          !loading &&
          !error &&
          chamadosFiltrados &&
          chamadosFiltrados.length > 0
        "
        class="chamados-list"
      >
        <q-card
          v-for="chamado in chamadosFiltrados"
          :key="chamado.Id"
          class="chamado-card"
          @click="mostrarDescricaoCompleta(chamado)"
        >
          <q-card-section class="">
            <!-- Cabeçalho do Chamado -->

            <div class="chamado-header">
              <!-- Esquerda: ID + Data -->
              <div
                class="chamado-id-data text-h6 text-blue-3 text-weight-medium"
              >
                {{ chamado.Id }} • {{ formatarData(chamado.OpeningDate) }}
              </div>

              <!-- Centro: Status + Nome do Local -->
              <div class="chamado-status-local flex items-center">
                <q-badge
                  :color="getStatusColor(chamado.Status)"
                  text-color="white"
                  size="xs"
                  class="q-mr-xs"
                  style="line-height: 1.2; padding: 2px 10px; font-size: 0.8rem"
                  outline
                  rounded
                >
                  {{ getStatusLabel(chamado.Status) }}
                </q-badge>
                <span
                  class="text-orange-3 text-weight-medium text-body1 chamado-nome-local"
                >
                  {{ chamado.Local?.Name || "Local não informado" }}
                </span>
              </div>

              <!-- Direita: Categoria -->
              <div
                class="chamado-categoria text-body2 text-blue-3 text-weight-medium"
              >
                {{ chamado.Category?.Name || "—" }}
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

    <q-dialog v-model="dialogDescricao" class="blurred-dialog">
      <q-card
        class="modal-completo "
        style="min-width: 95vw; width: 95vw; max-width: 95vw"
      >
        <!-- Cabeçalho -->
        <q-card-section class="row q-pa-md items-center">
          <div
            class="text-subtitle1 text-bold col-12 col-sm-6 q-mb-xs q-sm-mb-0"
          >
            Chamado: {{ chamadoSelecionado?.Id }} -
            {{ chamadoSelecionado?.Local?.Name || "Local não informado" }}
          </div>

          <div class="col-6 col-sm-2 text-center q-mb-xs q-sm-mb-0">
            <q-icon
              name="schedule"
              color="orange-8"
              size="20px"
              class="q-mr-sm"
            />
            {{ formatarData(chamadoSelecionado?.OpeningDate) }}
          </div>

          <div class="col-6 col-sm-3 text-center q-mb-xs q-sm-mb-0">
            <q-badge
              :color="getStatusColor(chamadoSelecionado?.Status)"
              text-color="white"
              size="md"
            >
              {{ getStatusLabel(chamadoSelecionado?.Status) }}
            </q-badge>
          </div>

          <div class="col-12 col-sm-1 text-right q-mt-sm q-sm-mt-0">
            <q-btn dense flat icon="close" v-close-popup round />
          </div>
        </q-card-section>

        <q-separator />

        <!-- Corpo do modal -->
        <q-card-section class="q-pt-sm">
          <div class="column q-gutter-sm">
            <!-- Contato (agora em coluna no mobile) -->
            <div class="col-12">
              <div class="row wrap items-center q-gutter-sm text-body2">
                <div class="row items-center col-12 q-mb-xs">
                  <q-icon
                    name="fas fa-user"
                    size="18px"
                    class="q-mr-sm"
                    style="color: #666"
                  />
                  <span class="text-weight-medium">{{
                    chamadoSelecionado?.ContactName || "—"
                  }}</span>
                  <div class="q-ml-md">
                    <q-icon
                      name="mail"
                      color="blue-8"
                      size="18px"
                      class="q-mr-sm"
                    />
                    <span>{{ chamadoSelecionado?.ContactMail || "—" }}</span>
                  </div>
                  <div class="q-ml-md">
                    <template v-if="chamadoSelecionado?.ContactPhone">
                      <a
                        @click.prevent="
                          abrirWhatsApp(chamadoSelecionado.ContactPhone)
                        "
                        style="
                          cursor: pointer;
                          display: inline-flex;
                          align-items: center;
                          text-decoration: none;
                          color: inherit;
                        "
                      >
                        <q-icon
                          name="fab fa-whatsapp"
                          size="18px"
                          class="q-mr-sm"
                          style="color: #25d366"
                        />
                        <span>{{ chamadoSelecionado.ContactPhone }}</span>
                      </a>
                    </template>
                    <template v-else>
                      <q-icon
                        name="fab fa-whatsapp"
                        size="18px"
                        class="q-mr-sm"
                        style="color: #25d366; opacity: 0.5"
                      />
                      <span>—</span>
                    </template>
                  </div>
                </div>

                <!-- Consulta SAT -->
                <div class="col-12 q-mt-sm">
                  <div class="row items-center q-gutter-sm flex-wrap">
                    <div class="text-body2 text-weight-medium">
                      Consultar SAT
                    </div>
                    <q-input
                      v-model="valor_numero_serie"
                      outlined
                      dense
                      placeholder="Digite o número de série"
                      class="col-11 col-sm-2"
                      @keyup.enter="buscar_SAT"
                    />
                    <q-btn
                      class="col-12 col-sm-auto q-mt-sm q-sm-mt-0"
                      color="blue"
                      icon="check_circle"
                      label="Verificar"
                      dense
                      @click="buscar_SAT"
                      rounded
                      :loading="loadingSAT"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Descrição -->
            <div class="col-12">
              <div class="text-caption text-grey-7 q-mb-xs">Descrição</div>
              <q-card flat bordered class="bg-grey-2">
                <q-card-section class="q-pa-md text-body1">
                  {{ chamadoSelecionado?.Description || "Sem descrição" }}
                </q-card-section>
              </q-card>
            </div>

            <!-- Equipamentos -->
            <div class="col-12" v-if="chamadoSelecionado?.Equipments?.length">
              <div class="text-caption text-grey-7 q-mb-xs">Equipamentos</div>
              <div class="row wrap q-gutter-xs">
                <q-chip
                  v-for="equip in chamadoSelecionado.Equipments"
                  :key="equip.Id"
                  dense
                  color="blue-1"
                  text-color="grey-9"
                  class="text-weight-medium"
                >
                  {{ equip.Name }}
                </q-chip>
              </div>
            </div>

            <!-- Ações Rápidas -->
            <div class="col-12 q-mt-sm">
              <div class="text-caption text-grey-7">Ações</div>
              <div
                class="row nowrap justify-center items-center q-gutter-sm q-mt-xs"
              >
                <q-btn
                  v-if="chamadoSelecionado.Status == 0"
                  size="md"
                  color="blue"
                  icon="assignment_turned_in"
                  label="Em atendimento"
                  @click="
                    abrirPromptAtualizacao(
                      2,
                      'Iniciar atendimento',
                      saudacao() +
                        ' o chamado foi recepcionado e está na fila de atendimento.'
                    )
                  "
                  push
                  outline
                  rounded
                />
                <q-btn
                  size="md"
                  color="teal"
                  icon="edit_note"
                  label="Responder"
                  @click="abrirPromptAtualizacao(9, 'Resposta', '')"
                  push
                  outline
                  rounded
                />
                <q-btn
                  size="md"
                  color="blue-grey-5"
                  icon="photo_camera"
                  label="Evidência"
                  @click="
                    abrirPromptAtualizacao(
                      9,
                      'Pedir evidência',
                      'Favor encaminhar a evidência para o WhatsApp.'
                    )
                  "
                  push
                  outline
                  rounded
                />
                <q-btn
                  size="md"
                  color="deep-purple"
                  icon="fact_check"
                  label="Validação"
                  @click="
                    abrirPromptAtualizacao(
                      9,
                      'Pedir validação',
                      'Favor verificar e validar.'
                    )
                  "
                  push
                  outline
                  rounded
                />
                <q-btn
                  size="md"
                  color="indigo"
                  icon="qr_code"
                  label="Nº série"
                  @click="
                    abrirPromptAtualizacao(
                      9,
                      'Solicitar número de série',
                      'Solicito o número de série do(s) equipamento(s).'
                    )
                  "
                  push
                  outline
                  rounded
                />
                <q-btn
                  size="md"
                  color="green"
                  icon="check_circle"
                  label="Fechar"
                  @click="
                    abrirPromptAtualizacao(
                      5,
                      'Chamado resolvido e finalizado',
                      'Chamado encerrado.'
                    )
                  "
                  push
                  outline
                  rounded
                />
              </div>
            </div>

            <!-- Encaminhamentos técnicos -->
            <div class="col-12 q-mt-xs">
              <div class="text-caption text-grey-7">Encaminhamentos</div>
              <div
                class="row nowrap justify-center items-center q-gutter-sm q-mt-xs"
              >
                <q-btn
                  size="md"
                  color="red"
                  icon="build"
                  label="Assistência técnica"
                  @click="
                    abrirPromptAtualizacao(
                      11,
                      'Encaminhar para assistência técnica',
                      'Encaminhado para assistência técnica OS: '
                    )
                  "
                  push
                  outline
                  rounded
                />
                <q-btn
                  size="md"
                  color="orange"
                  icon="engineering"
                  label="Nível 2"
                  @click="
                    abrirPromptAtualizacao(
                      12,
                      'Chamado encaminhado para nível 2',
                      'Chamado encaminhado para nível 2.'
                    )
                  "
                  push
                  outline
                  rounded
                />
                <q-btn
                  size="md"
                  color="brown"
                  icon="precision_manufacturing"
                  label="Nível 3"
                  @click="
                    abrirPromptAtualizacao(
                      10,
                      'Chamado encaminhado para nível 3',
                      'Chamado encaminhado para nível 3.'
                    )
                  "
                  push
                  outline
                  rounded
                />
              </div>
            </div>

            <!-- Histórico de Atendimento -->
            <div class="col-12" v-if="chamadoSelecionado?.HistoryCalls?.length">
              <div class="text-caption text-grey-7 q-mt-md q-mb-xs">
                Histórico de Atendimento
              </div>
              <q-timeline color="primary" class="q-mt-md">
                <q-timeline-entry
                  v-for="(hist, index) in chamadoSelecionado.HistoryCalls"
                  :key="index"
                  :title="hist.User?.Name || 'Sistema'"
                  :subtitle="formatarData(hist.Date)"
                  icon="chat"
                  icon-color="primary"
                >
                  <div class="text-caption text-grey-8">
                    Status: {{ getStatusLabel(hist.Status) }}
                  </div>
                  <div class="text-body2 q-mt-xs">
                    {{ hist.Description || "Sem descrição" }}
                  </div>
                </q-timeline-entry>
              </q-timeline>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Rodapé -->
        <q-card-actions align="center" class="q-pa-md">
          <q-btn
            label="Fechar"
            color="primary"
            outline
            v-close-popup
            class="full-width"
          />
        </q-card-actions>
      </q-card>

      <!-- </div> -->
      <!-- </q-card> -->
    </q-dialog>
    <!-- No final do seu template, dentro de <q-page> -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        v-show="showScrollTopButton"
        fab
        icon="arrow_upward"
        color="primary"
        @click="scrollToTop"
        class="shadow-4"
      >
        <q-tooltip>Ir para o topo</q-tooltip>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>
<!-- 46198  -->
<script setup>
import { ref, onMounted, computed, onUnmounted, watch, nextTick } from "vue";
import { useQuasar } from "quasar";
import { useChamadosStore } from "stores/chamados";

 import { useAuthStore } from "stores/auth";
  const authStore = useAuthStore();



const chamadosStore = useChamadosStore();
const $q = useQuasar();

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

// ... imports existentes ...

// Filtros
const filtroTexto = ref("");
const filtroNumeroChamado = ref("");
const filtroStatus = ref(null); // 0 = abertos, null = todos

const savedScrollPosition = ref(0);

const showScrollTopButton = ref(false);

const loadingSAT = ref(false);
// Filtro de ordenação
const ordenacao = ref("recentes"); // 'recentes' ou 'antigos'

import { useRoute } from "vue-router";

const route = useRoute();

const handleScroll = () => {
  // Mostra o botão se o usuário rolar mais de 400px
  showScrollTopButton.value = window.scrollY > 400;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth", // rolagem suave
  });
};

// Função para limpar todos os filtros
const limparFiltros = () => {
  filtroTexto.value = "";
  filtroStatus.value = null; // ou null, se "Todos" for null
  ordenacao.value = "recentes";
  filtroNumeroChamado.value = "";
};

// Função para abrir o dialog (ex: ao clicar no card)
const openDialog = () => {
  // Salva a posição atual do scroll
  savedScrollPosition.value = window.scrollY;
  // Abre o dialog (ex: this.$refs.dialog.show())
};

// Função para fechar o dialog
const closeDialog = () => {
  // Fecha o dialog primeiro
  // this.$refs.dialog.hide()

  // Depois, restaura a posição do scroll
  setTimeout(() => {
    window.scrollTo({
      top: savedScrollPosition.value,
      behavior: "smooth", // opcional: animação suave
    });
  }, 100); // pequeno delay para garantir que o dialog já foi removido
};

const opcoesStatus = [
  { label: "Todos", value: null },
  { label: "Abertos", value: 0 },
  { label: "Em analise", value: 1 },
  { label: "Em atendimento", value: 2 },
  { label: "Feedback", value: 8 },
  { label: "Nivel 2", value: 12 },
  { label: "Nivel 3", value: 10 },
  { label: "Aguardando resposta", value: 9 },
  { label: "Aguardando assistencia", value: 11 },
  { label: "Fechado", value: 5 },
];

// Mapeamento de status para rótulos legíveis
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

function copiarChamado() {
  const texto = `Chamado: ${chamadoSelecionado.value?.Id} - ${
    chamadoSelecionado.value?.Local?.Name || "Local não informado"
  }`;
  navigator.clipboard.writeText(texto);
  $q.notify({
    message: "Copiado para a área de transferência!",
    color: "info",
    textColor: "black",
    position: "top",
    icon: "check",
  });
}

const formatarNumeroWhatsApp = (numero) => {
  let soNumeros = numero.replace(/\D/g, "");
  if (soNumeros.startsWith("0")) soNumeros = soNumeros.substring(1);
  if (!soNumeros.startsWith("55")) soNumeros = "55" + soNumeros;
  return soNumeros;
};

const buscar_SAT = async () => {
  loadingSAT.value = true;

  // Remove espaços em branco no início e no fim
  // const numeroLimpo = valor_numero_serie.value?.trim();

  // 1. Remove espaços e atualiza o campo imediatamente
  valor_numero_serie.value = valor_numero_serie.value?.trim() || "";

  const numeroLimpo = valor_numero_serie.value;

  try {
    if (!numeroLimpo) {
      $q.dialog({
        title: "Atenção",
        message: "Por favor, informe um número de série.",
        color: "warning",
        ok: { label: "OK", color: "warning" },
      });
      return;
    }

    // console.log(numeroLimpo);

    const respostaSAT = await chamadosStore.satSerie(numeroLimpo);

    if (respostaSAT.data.length === 0) {
      $q.dialog({
        title: "Erro",
        message: "Número de série não encontrado!",
        color: "negative",
        ok: { label: "OK", color: "negative" },
      });
    } else if (respostaSAT.data.length > 1) {
      $q.dialog({
        title: "Atenção",
        message:
          "Está faltando caracteres no número de série, mais de um SAT encontrado!",
        color: "warning",
        ok: { label: "OK", color: "warning" },
      });
      valor_numero_serie.value = ""; // Limpa após ambiguidade
    } else {
      const w = respostaSAT.data[0];

      // Validação opcional (pode ser removida se a API já garante correspondência exata)
      if (valor_numero_serie.value === w.numSerie) {
        valor_saida_sat.value = w;

        $q.dialog({
          title: "SAT Encontrado - N/S: " + w.numSerie,
          html: true,
          message: `
            <ul style="text-align: left; margin: 0; padding-left: 25px;">

              <li><strong>Cliente:</strong> ${w.cliente.nomeFantasia}</li>
              <li><strong>Local:</strong> ${w.localAtendimento.nomeLocal}</li>
              <li><strong>Equipamento:</strong> ${w.equipamento.codEEquip}</li>
              <li><strong>Ativo:</strong> ${w.indAtivo ? "sim" : "não"}</li>
              <li>
  <strong>Tipo de intervenção:</strong>
  ${
    w.indAtivo
      ? '<strong><span style="color: blue;">Corretiva</span></strong>'
      : '<strong><span style="color: red;">Orçamento</span></strong>'
  }
</li>
<li><strong>Nome solicitante:</strong> ${chamadosStore.detalhe_chamado.ContactName }</li>
<li><strong>Telefone solicitante:</strong> ${chamadosStore.detalhe_chamado.ContactPhone}</li>
<li><strong>Chamado cliente:</strong> ${chamadosStore.detalhe_chamado.Id }</li>
<li><strong>Defeito:</strong> ${chamadosStore.detalhe_chamado.Description }</li>

            </ul>
          `,
          color: "positive",
          ok: { label: "OK", color: "positive" },
          onOk: async () => {
            valor_numero_serie.value = "";
          },
        });
      } else {
        $q.dialog({
          title: "Erro",
          message: "Número de série não corresponde ao retornado!",
          color: "negative",
          ok: { label: "OK", color: "negative" },
        });
        valor_numero_serie.value = ""; // Limpa após erro de validação
      }
    }
  } catch (error) {
    // console.error('Erro ao buscar SAT:', error);
    $q.dialog({
      title: "Erro",
      message: "Ocorreu um erro durante a busca do SAT. Tente novamente.",
      color: "negative",
      ok: { label: "OK", color: "negative" },
    });
    valor_numero_serie.value = ""; // Limpa após erro de rede/exceção
  } finally {
    loadingSAT.value = false;
    valor_numero_serie.value = "";
  }
};

function saudacao() {
  const hora = new Date().getHours();

  if (hora >= 0 && hora < 12) {
    return "Bom dia, ";
  } else if (hora >= 12 && hora < 18) {
    return "Boa tarde, ";
  } else {
    return "Boa noite, ";
  }
}

const abrirWhatsApp = (numero) => {
  const numeroFormatado = formatarNumeroWhatsApp(numero);

  // Tenta abrir no app nativo
  const whatsappUrl = `whatsapp://send?phone=${numeroFormatado}`;
  const webUrl = `https://wa.me/${numeroFormatado}`;

  // Abre o deep link
  window.location.href = whatsappUrl;

  // Fallback para web após 1 segundo (se o app não responder)
  setTimeout(() => {
    // Só abre no web se o usuário ainda estiver na mesma aba (ou seja, o app não abriu)
    if (!document.hidden) {
      window.open(webUrl, "_blank");
    }
  }, 1000);
};

// Opcional: definir cores por status (para badge)
const getStatusColor = (status) => {
  const colors = {
    // 0: "green", // Aberto
    // 1: "orange", // Em análise
    // 2: "blue", // Em atendimento
    // 8: "teal", // Feedback
    // 9: "amber", // Aguardando resposta
    // 10: "purple", // Nível 3
    // 11: "brown", // Aguardando assistência
    // 12: "deep-purple", // Nível 2

    0: "green",
    1: "amber",
    2: "orange",
    8: "blue",
    9: "amber",
    10: "purple",
    11: "blue-grey",
    12: "indigo",
  };
  return colors[status] || "grey";
};

// Atualiza a computed para considerar os filtros
const chamadosFiltrados = computed(() => {
  let lista = [...chamados.value];

  // Filtro por status
  if (filtroStatus.value !== null) {
    lista = lista.filter((chamado) => chamado.Status === filtroStatus.value);
  }

  // Filtro por texto (local ou descrição)
  if (filtroTexto.value) {
    const termo = filtroTexto.value.toLowerCase();
    lista = lista.filter(
      (chamado) =>
        chamado.Local?.Name?.toLowerCase().includes(termo) ||
        chamado.Description?.toLowerCase().includes(termo) ||
        chamado.User.Name?.toLowerCase().includes(termo)
    );
  }

  // Filtro por número do chamado (ID) – busca parcial
  if (filtroNumeroChamado.value) {
    const termoId = filtroNumeroChamado.value.trim();
    if (termoId) {
      lista = lista.filter((chamado) => {
        return chamado.Id != null && chamado.Id.toString().includes(termoId);
      });
    }
  }

  // Ordenação
  lista.sort((a, b) => {
    const dateA = new Date(a.OpeningDate);
    const dateB = new Date(b.OpeningDate);
    if (ordenacao.value === "recentes") {
      return dateB - dateA; // mais recente primeiro
    } else {
      return dateA - dateB; // mais antigo primeiro
    }
  });

  return lista;
  // Ordenação: mais recentes primeiro
  // return lista.sort((a, b) => new Date(b.OpeningDate) - new Date(a.OpeningDate))
});

const abrirPromptAtualizacao = (novoStatus, placeholderTexto, texto) => {
  $q.dialog({
    title: placeholderTexto,

    // message: "Descreva brevemente a ação realizada:",
    prompt: {
      model: texto,
      counter: true,
      maxlength: "400",
      outlined: true,
      label: "Descrição",

      // placeholder: placeholderTexto,

      type: "textarea",
      isValid: (val) => val && val.trim().length > 0,
    },
    cancel: true,
    // persistent: true,
    ok: "Confirmar",
    cancel: "Cancelar",
  }).onOk(async (descricao) => {
    await atualizarStatusChamado(novoStatus, descricao.trim());
  });
};

// Formata data para exibição amigável

const atualizarStatusChamado = async (novoStatus, descricao) => {
  if (!chamadoSelecionado.value?.Id) return;

  try {
    // chamadosStore.atualizarStatusNoStore(novoStatus, descricao);
    // 1. Atualiza o status no backend (ou store)
    const result = await chamadosStore.atualizarStatusNoStore(
      novoStatus,
      descricao
    );

    // if (result.success) {
    $q.notify({
      position: "top",
      color: "positive",
      message: "Atualizado!",
      icon: "check",
    });



    // 3. RECARREGA OS DETALHES COMPLETOS DO CHAMADO (inclui novo histórico)
    await fetchDetalhesChamadoData(chamadoSelecionado.value.Id);

    // 3. Atualiza o objeto reativo SEM fechar o modal
    chamadoSelecionado.value = { ...chamadosStore.detalhe_chamado };

    const dados ={
chamado: chamadoSelecionado.value.Id,
status: novoStatus,
email: authStore.usuario.Login,
nome: authStore.usuario.Name
    }
console.log("enviado back "+dados);

   await chamadosStore.meus_chamados(dados)

  } catch (err) {
    $q.notify({
      position: "top",
      color: "negative",
      message:
        "Erro ao atualizar chamado: " + (err.message || "tente novamente"),
      icon: "error",
    });
  } finally {
    // 5. (Opcional) Atualiza também a lista principal
    await fetchData();
  }
};

const formatarData = (dataISO) => {
  if (!dataISO) return "—";
  const data = new Date(dataISO);
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Trunca texto longo
const truncarTexto = (texto, limite) => {
  if (!texto) return "";
  return texto.length > limite ? texto.substring(0, limite) + "…" : texto;
};

// Observa quando o dialog é fechado
watch(dialogDescricao, (isOpen) => {
  if (!isOpen) {
    // Modal foi fechado → restaura scroll
    setTimeout(() => {
      window.scrollTo({
        top: savedScrollPosition.value,
        // behavior: 'smooth'
        behavior: "instant",
      });
    }, 100);
  }
});

const mostrarDescricaoCompleta = async (chamado) => {
  // 👇 Salva a posição do scroll ANTES de qualquer coisa
  savedScrollPosition.value = window.scrollY;
  loading.value = true;
  try {
    // busca os detalhes antes
    await fetchDetalhesChamadoData(chamado.Id);

    // guarda os dados retornados
    chamadoSelecionado.value = detalhe_chamado.value || chamado;

    // só abre o modal depois que tudo foi carregado
    dialogDescricao.value = true; //abre o modal
  } finally {
    loading.value = false;
  }
};

// Busca dados da API
const fetchData = async () => {
  // 👇 Salva a posição do scroll ANTES de atualizar
  const currentScroll = window.scrollY;

  loading.value = true;
  error.value = null;

  try {
    const result = await chamadosStore.fetchChamados();

    if (!result.success) {
      throw new Error(result.message || "Falha ao carregar chamados");
    }

    chamados.value = result.data || [];

    // 👇 Restaura o scroll IMEDIATAMENTE após atualizar os dados
    // Usa nextTick para garantir que o DOM já foi atualizado
    nextTick(() => {
      window.scrollTo({ top: currentScroll, behavior: "auto" });
    });

    lastUpdate.value = new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (err) {
    error.value = err.message || "Erro desconhecido";
  } finally {
    loading.value = false;
  }
};

const fetchDetalhesChamadoData = async (id) => {
  loading.value = true;
  error.value = null;

  try {
    const result = await chamadosStore.fetchDetalheChamados(id);

    if (!result.success) {
      throw new Error(result.message || "Falha ao carregar chamados");
    }

    detalhe_chamado.value = result.data || [];
  } catch (err) {
    error.value = err.message || "Erro desconhecido";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
  intervalId = setInterval(fetchData, 120000); // 5 minutos

  window.addEventListener("scroll", handleScroll);

  // Aplica filtro de status (se houver)
  const statusQuery = route.query.status;
  if (statusQuery !== undefined) {
    const statusNum = parseInt(statusQuery, 10);
    if (!isNaN(statusNum)) {
      filtroStatus.value = statusNum;
    }
  }

  // Aplica filtro de local (se houver)
  const localQuery = route.query.local;
  if (localQuery) {
    filtroTexto.value = decodeURIComponent(localQuery);
  }
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);

  window.removeEventListener("scroll", handleScroll);
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

.meu_card {
  /* min-width: 50vw; */
  /* display: flex; */
}

.no-overflow-x {
  overflow-x: hidden;
  word-break: break-word;
}

.text-wrap {
  word-wrap: break-word;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}
/* Aplica desfoque na camada de fundo do dialog */
.blurred-dialog .q-dialog__backdrop {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* compatibilidade Safari */
}

.col {
  /* border: 2px red solid; */
}
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
  /* background: #22354b; */
  background: linear-gradient(135deg, #1c2b36 0%, #2c3e50 100%);
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
  gap: 14px;
}
body {
}

.chamado-card {
  border-radius: 10px;
  background: #2c3749;
  /* box-shadow: 10px 10px 10px 10px white; */
  transition: all 0.35s ease;
  cursor: pointer;
  border: 2px solid silver;
  display: flex;
  flex-direction: column;
  min-height: 80px; /* ✅ Altura mínima para evitar cards muito curtos */

  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  /* font-family: 'Poppins', sans-serif; */
}

.chamado-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  background: #2f3a49;
}

.chamado-header {
  display: flex;
  align-items: center; /* ✅ Alinha todos os filhos verticalmente ao centro */
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 44px; /* ✅ Altura mínima fixa para alinhar todos os cards */
}

/* Esquerda: ID + Data — não cresce, não encolhe */
.chamado-id-data {
  flex: 0 0 auto;
  white-space: nowrap;
}

/* Centro: Status + Nome — ocupa o espaço restante */
.chamado-status-local {
  flex: 1 1 auto;
  min-width: 0; /* ✅ Permite que o texto seja truncado */
  justify-content: center;
}

/* Nome do local: não quebra linha, trunca se necessário */
.chamado-nome-local {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 4px; /* pequeno espaçamento após a badge */
}

/* Direita: Categoria — fixa */
.chamado-categoria {
  flex: 0 0 auto;
  white-space: nowrap;
}

.descricao-completa {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
}

.filtros-section {
  background: rgba(255, 255, 255, 0.03);
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
/* Responsividade */
@media (max-width: 768px) {
  .chamado-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 6px;
    padding: 10px;
  }

  .chamado-id-data,
  .chamado-status-local,
  .chamado-categoria {
    flex: none !important;
    width: 100%;
    white-space: normal !important;
    text-align: left;
  }

  .chamado-nome-local {
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: unset;
  }

  .chamado-descricao .text-body1 {
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .chamado-card {
    padding: 0;
    min-height: auto;
  }
}
</style>
