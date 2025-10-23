<template>
  <q-page class="dashboard-page">
    <div class="container">
      <!-- Header Compacto -->

      <div class="text-subtitle1 text-weight text-white column items-center">
        {{ chamadosFiltrados.length }} chamados • Atualizado: {{ lastUpdate }}
      </div>
      <div class="filtros-section q-mb-md">
        <div class="row q-gutter-sm">
          <!-- Busca -->

          <q-input
            v-model="filtroNumeroChamado"
            dense
            outlined
            placeholder="Nº do chamado"
            class="col-3 col-sm-2"
            input-class="text-white"
            bg-color="dark"
            type="text"
          >
            <template v-slot:prepend>
              <q-icon name="tag" color="grey-5" />
            </template>
          </q-input>

          <q-input
            v-model="filtroTexto"
            dense
            outlined
            dark
            color="blue-4"
            placeholder="Buscar por local, descrição..."
            class="col"
            input-class="text-white"
            bg-color="dark"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-5" />
            </template>
          </q-input>

          <!-- Status -->
          <q-select
            v-model="filtroStatus"
            :options="opcoesStatus"
            dense
            outlined
            dark
            color="blue-4"
            emit-value
            map-options
            class="col-4 col-sm-3"
            input-class="text-white"
            bg-color="dark"
            options-dark
            popup-content-class="bg-dark text-white"
          />

          <!-- Ordenação -->
          <q-select
            v-model="ordenacao"
            :options="[
              { label: 'Mais recentes', value: 'recentes' },
              { label: 'Mais antigos', value: 'antigos' },
            ]"
            dense
            outlined
            dark
            color="blue-4"
            emit-value
            map-options
            class="col-3 col-sm-2"
            input-class="text-white"
            bg-color="dark"
            options-dark
            popup-content-class="bg-dark text-white"
          />
          <!-- <q-btn
            dense
            flat
            icon="clear"
            color="grey-5"
            @click="limparFiltros"
            title="Limpar todos os filtros"
            class="q-ml-auto"
          >
            <q-tooltip>LIMPAR FILTROS</q-tooltip>
          </q-btn> -->

          <!-- Botão de recarregar -->
          <q-btn
            dense
            flat
            icon="refresh"
            color="grey-5"
            @click="fetchData"
            :disable="loading"
            title="Atualizar chamados agora"
            class="q-ml-xs"
          >
            <q-tooltip>ATUALIZAR AGORA</q-tooltip>
          </q-btn>

          <!-- Botão Limpar Filtros -->
          <q-btn
            dense
            flat
            icon="clear"
            color="grey-5"
            @click="limparFiltros"
            title="Limpar todos os filtros"
            class="q-ml-auto"
          >
            <q-tooltip>LIMPAR FILTROS</q-tooltip>
          </q-btn>
        </div>
        <!-- Botão Limpar Filtros (extrema direita) -->
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
          <q-card-section class="p-0">
            <!-- Cabeçalho do Chamado -->

            <div class="chamado-header">
              <!-- Esquerda: ID + Data -->
              <div class="chamado-id-data text-h6 text-blue-5">
                {{ chamado.Id }} • {{ formatarData(chamado.OpeningDate) }}
              </div>

              <!-- Centro: Status + Nome do Local -->
              <div class="chamado-status-local flex items-center">
                <q-badge
                  :color="getStatusColor(chamado.Status)"
                  text-color="white"
                  size="xs"
                  class="q-mr-xs"
                  style="line-height: 1.2; padding: 2px 6px; font-size: 0.72rem"
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

    <!-- Modal com detalhes do chamado -->
    <!-- <q-dialog v-model="dialogDescricao"> -->
    <q-dialog v-model="dialogDescricao">
      <q-card style="min-width: 90vw; position: relative">
        <!-- <div
      v-if="loading"
      class="absolute-full flex flex-center bg-black bg-opacity-30 z-top"
      style="border-radius: inherit;">
      <q-spinner color="white" size="2em" />
    </div>

    <div v-else> -->

        <q-card class="modal-completo" style="min-width: 90vw">
          <!-- Cabeçalho -->
          <q-card-section class="row q-pa-sm items-center">
            <!-- <div class="row items-center"> -->

            <div
              class="text-subtitle1 text-bold col col-6 items-center flex justify-start"
            >
              Chamado: {{ chamadoSelecionado?.Id }} -
              {{ chamadoSelecionado?.Local?.Name || "Local não informado" }}

              <q-icon
                name="content_copy"
                size="18px"
                class="q-ml-sm cursor-pointer text-grey-5 hover:text-primary"
                @click="copiarChamado"
              />
            </div>

            <div class="col items-center flex justify-center text-body2">
              <q-icon
                name="schedule"
                color="orange-8"
                size="18px"
                class="q-mr-sm"
              />
              {{ formatarData(chamadoSelecionado?.OpeningDate) }}
            </div>

            <div class="col items-center flex justify-center">
              <q-badge
                :color="getStatusColor(chamadoSelecionado?.Status)"
                text-color="white"
                size="md"
                class=""
              >
                {{ getStatusLabel(chamadoSelecionado?.Status) }}
              </q-badge>
            </div>

            <div class="col-1 col items-center flex justify-end">
              <q-btn dense flat icon="close" v-close-popup round />
            </div>
            <!-- </div> -->
            <!-- <q-space /> -->
          </q-card-section>

          <q-separator />


          <!-- Corpo do modal -->
          <q-card-section class="q-pt-sm">
            <div class="row q-gutter-sm">
              <!-- Local -->
              <div class="col-12">
                <div class="row items-center text-body2"></div>
              </div>

              <!-- Contato (tudo em uma linha) -->
              <div class="col-12">
                <div class="row items-center text-body2">
                  <q-icon
                    name="fas fa-user"
                    size="18px"
                    class="q-mr-sm"
                    style="color: #666"
                  />
                  <span class="text-weight-medium">{{
                    chamadoSelecionado?.ContactName || "—"
                  }}</span>

                  <q-icon
                    name="mail"
                    color="blue-8"
                    size="18px"
                    class="q-ml-xl q-mr-sm"
                  />
                  <span class="text-silver-9">{{
                    chamadoSelecionado?.ContactMail || "—"
                  }}</span>

                  <a
                    v-if="chamadoSelecionado?.ContactPhone"
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
                      class="q-ml-md q-mr-sm"
                      style="color: #25d366"
                    />
                    <span>{{ chamadoSelecionado.ContactPhone }}</span>
                  </a>
                  <span v-else>
                    <q-icon
                      name="fab fa-whatsapp"
                      size="18px"
                      class="q-ml-md q-mr-sm"
                      style="color: #25d366; opacity: 0.5"
                    />
                    <span>—</span>
                  </span>

                  <!-- <div class="row items-center q-ml-xl">
            <q-input v-model="valor_numero_serie" outlined dense> </q-input>
            <q-btn
              class="q-ml-lg"
              color="green"
              icon="check_circle"
              label="Verificar SAT"
              dense
            />

          </div> -->

<<<<<<< HEAD
                  <div class="row items-center q-ml-xl q-gutter-sm">
                    <div class="text-body2 text-weight-medium">
                      Consulta SAT
                    </div>
                    <q-input
                      v-model="valor_numero_serie"
                      outlined
                      dense
                      placeholder="Digite o número de série"
                      style="width: 120px"
                      disable
                    />
                    <q-btn
                      class="q-ml-sm"
                      color="positive"
                      icon="check_circle"
                      label="Verificar"
                      dense
                      push
                      disable
                    />
                  </div>
=======
          <div class="row items-center q-ml-xl q-gutter-sm">
  <div class="text-body2 text-weight-medium">Consulta SAT</div>
  <q-input
    v-model="valor_numero_serie"
    outlined

    dense
    placeholder="Digite o número de série"
    style="width: 175px"
    disable
  />
  <q-btn
    class="q-ml-sm"
    color="positive"
    icon="check_circle"
    label="Verificar"
    dense


    rounded
    disable
    outline
glossy
  />
</div>


>>>>>>> a925e6bd37174b904c51dc56d26ff2a9fa450fe7
                </div>
              </div>

              <!-- Verificar SAT -->

              <!-- Descrição -->
              <div class="col-12">
                <div class="text-caption text-grey-7 q-mb-xs">Descrição</div>
                <q-card flat bordered class="bg-grey-2">
                  <q-card-section class="q-pa-sm text-body1">
                    {{ chamadoSelecionado?.Description || "Sem descrição" }}
                  </q-card-section>
                </q-card>
              </div>




              <!-- Equipamentos -->
              <div class="col-12" v-if="chamadoSelecionado?.Equipments?.length">
                <div class="text-caption text-grey-7 q-mb-xs">Equipamentos</div>
                <div class="row q-gutter-xs">
                  <q-chip
                    v-for="equip in chamadoSelecionado.Equipments"
                    :key="equip.Id"
                    dense
                    color="orange-1"
                    text-color="grey-9"
                    class="text-weight-medium"
                  >
                    {{ equip.Name }}
                  </q-chip>
                </div>
              </div>

              <!-- Ações Rápidas -->
              <div class="col-12 q-mt-md">
                <div class="text-caption text-grey-7 q-mb-xs">Ações</div>
                <!-- <div class="row items-center justify-center q-gutter-sm">



                  <q-btn
                    size="md"
                    color="teal-10"
                    icon="inventory"
                    label="Responder"
                    @click="
                      abrirPromptAtualizacao(9, 'Resposta','' )
                    "
                    dense

                    push
                  />

                  <q-btn
                    size="md"
                    color="orange-10"
                    icon="photo_camera"
                    label="Pedir evidência"
                    @click="abrirPromptAtualizacao(9, 'Pedir evidência', 'favor encaminhar a evidencia para o whatsapp ')"
                    dense

                    push
                  />
                  <q-btn
                    size="md"
                    color="teal-5"
                    icon="inventory"
                    label="Solicitar nº série"
                    @click="
                      abrirPromptAtualizacao(9, 'Solicitar número de série','solicito numero de série do(s) equipamento(s).' )
                    "
                    dense

                    push
                  />
                  <q-btn
                    size="md"
                    color="blue-8"
                    icon="engineering"
                    label="Em atendimento"
                    @click="abrirPromptAtualizacao(2, 'Iniciar atendimento','o chamado foi recepcionado e está na fila de atendimento.')"
                    dense

                    push
                  />
                  <q-btn
                    size="md"
                    color="brown"
                    icon="build"
                    label="Assistência técnica"
                    @click="
                      abrirPromptAtualizacao(
                        11,
                        'Encaminhar para assistência técnica','encaminhado para assistência técnica OS: '
                      )
                    "
                    dense

                    push
                  />

                  <q-btn
                    size="md"
                    color="blue-10"
                    icon="build"
                    label="Nivel 2"
                    @click="
                      abrirPromptAtualizacao(
                        12,
                        'chamado encaminhado para nível 2','chamado encaminhado para nível 2'
                      )
                    "
                    dense

                    push
                  />

                  <q-btn
                    size="md"
                    color="purple-6"
                    icon="build"
                    label="Nivel 3"
                    @click="
                      abrirPromptAtualizacao(
                        10,
                        'chamado encaminhado para nível 3','chamado encaminhado para nível 3'
                      )
                    "
                    dense

                    push
                  />

                  <q-btn
                    size="md"
                    color="green"
                    icon="check_circle"
                    label="Fechar chamado"
                    @click="
                      abrirPromptAtualizacao(
                        5,
                        'Chamado resolvido e finalizado','Chamado finalizado'
                      )
                    "
                    dense

                    push
                  />
                </div> -->

                <div class="row items-center justify-center q-gutter-sm">
                  <!-- Ações de atualização / comunicação -->
                  <q-btn
                    size="md"
                    color="primary"
                    icon="edit_note"
                    label="Responder"
                    @click="abrirPromptAtualizacao(9, 'Resposta', '')"
                    dense
                    push
                  />

                  <q-btn
                    size="md"
                    color="warning"
                    icon="photo_camera"
                    label="Pedir evidência"
                    @click="
                      abrirPromptAtualizacao(
                        9,
                        'Pedir evidência',
                        'favor encaminhar a evidencia para o whatsapp '
                      )
                    "
                    dense
                    push
                  />

                  <q-btn
                    size="md"
                    color="blue-grey"
                    icon="fact_check"
                    label="Pedir validação"
                    @click="
                      abrirPromptAtualizacao(
                        9,
                        'Pedir validacao',
                        'favor verificar e validar. '
                      )
                    "
                    dense
                    push
                  />

                  <q-btn
                    size="md"
                    color="info"
                    icon="qr_code"
                    label="Solicitar nº série"
                    @click="
                      abrirPromptAtualizacao(
                        9,
                        'Solicitar número de série',
                        'solicito numero de série do(s) equipamento(s).'
                      )
                    "
                    dense
                    push
                  />

                  <!-- Status do chamado -->
                  <q-btn
                    size="md"
                    color="blue"
                    icon="assignment_turned_in"
                    label="Em atendimento"
                    @click="
                      abrirPromptAtualizacao(
                        2,
                        'Iniciar atendimento',
                        saudacao()+'o chamado foi recepcionado e está na fila de atendimento.'
                      )
                    "
                    dense
                    push
                  />

                  <q-btn
                    size="md"
                    color="amber"
                    icon="build"
                    label="Assistência técnica"
                    @click="
                      abrirPromptAtualizacao(
                        11,
                        'Encaminhar para assistência técnica',
                        'encaminhado para assistência técnica OS: '
                      )
                    "
                    dense
                    push
                  />

                  <q-btn
                    size="md"
                    color="deep-orange"
                    icon="engineering"
                    label="Nível 2"
                    @click="
                      abrirPromptAtualizacao(
                        12,
                        'chamado encaminhado para nível 2',
                        'chamado encaminhado para nível 2'
                      )
                    "
                    dense
                    push
                  />

                  <q-btn
                    size="md"
                    color="brown"
                    icon="precision_manufacturing"
                    label="Nível 3"
                    @click="
                      abrirPromptAtualizacao(
                        10,
                        'chamado encaminhado para nível 3',
                        'chamado encaminhado para nível 3'
                      )
                    "
                    dense
                    push
                  />

                  <!-- Conclusão -->
                  <q-btn
                    size="md"
                    color="positive"
                    icon="check_circle"
                    label="Fechar chamado"
                    @click="
                      abrirPromptAtualizacao(
                        5,
                        'Chamado resolvido e finalizado',
                        'chamado encerrado.'
                      )
                    "
                    dense
                    push
                  />
                </div>
              </div>

              <!-- Histórico de Atendimento -->
              <div
                class="col-12"
                v-if="chamadoSelecionado?.HistoryCalls?.length"
              >
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
          <q-card-actions align="right" class="q-pr-md q-pb-md">
            <q-btn label="Fechar" color="primary" outline v-close-popup />
          </q-card-actions>
        </q-card>

        <!-- </div> -->
      </q-card>
    </q-dialog>
  </q-page>
</template>
<!-- 46198  -->
<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useQuasar } from "quasar";
import { useChamadosStore } from "stores/chamados";

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
const valor_saida_sat = ref("");

// ... imports existentes ...

// Filtros
const filtroTexto = ref("");
const filtroNumeroChamado = ref("");
const filtroStatus = ref(null); // 0 = abertos, null = todos

// Filtro de ordenação
const ordenacao = ref("recentes"); // 'recentes' ou 'antigos'

// Função para limpar todos os filtros
const limparFiltros = () => {
  filtroTexto.value = "";
  filtroStatus.value = null; // ou null, se "Todos" for null
  ordenacao.value = "recentes";
  filtroNumeroChamado.value = "";
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

const buscar_SAT = () => {
  // Lógica para buscar o SAT usando o valor do número de série
  console.log("Buscando SAT para o número de série:", valor_numero_serie.value);
  const w = valor_numero_serie.value;
  if (w.includes("SAT")) {
    valor_saida_sat.value = "SAT encontrado com sucesso!";

    $q.notify({
      position: "top",
      caption: "parabens campeao",
      color: "positive",
      message: "SAT encontrado com sucesso!",
      icon: "error",
    });
  } else {
    valor_saida_sat.value = "SAT não encontrado.";
    $q.notify({
      position: "top",
      color: "negative",
      message: "SAT não encontrado.",
      icon: "error",
    });
  }

  // Aqui você pode adicionar a chamada à API ou qualquer outra lógica necessária
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
    0: "green", // Aberto
    1: "orange", // Em análise
    2: "blue", // Em atendimento
    8: "teal", // Feedback
    9: "amber", // Aguardando resposta
    10: "purple", // Nível 3
    11: "brown", // Aguardando assistência
    12: "deep-purple", // Nível 2
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
        chamado.Description?.toLowerCase().includes(termo)
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

// Filtra e ordena chamados (Status = 0, por data crescente)
//const chamadosFiltrados = computed(() => {
//return [...chamados.value]
//.filter(chamado => chamado.Status === 0)
//  .sort((a, b) => new Date(b.OpeningDate) - new Date(a.OpeningDate))
//})
const abrirPromptAtualizacao = (novoStatus, placeholderTexto, texto) => {
  $q.dialog({
    title: placeholderTexto,

    // message: "Descreva brevemente a ação realizada:",
    prompt: {
      model: texto,
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

// Mostra descrição completa em modal
// const mostrarDescricaoCompleta = async (chamado) => {
//   dialogDescricao.value = true;
//   console.log("Chamado selecionado:", chamado);

//   // Primeiro, busca os detalhes atualizados
//   chamadoSelecionado.value = chamado;
//   var teste = await fetchDetalhesChamadoData(chamado.Id); // 👈 passa o ID
//   console.log("Detalhes do chamado carregados:", detalhe_chamado.value);
//   chamadoSelecionado.value = detalhe_chamado.value;
//   console.log(chamado.Id);
// };

const mostrarDescricaoCompleta = async (chamado) => {
  loading.value = true;
  try {
    // busca os detalhes antes
    await fetchDetalhesChamadoData(chamado.Id);

    // guarda os dados retornados
    chamadoSelecionado.value = detalhe_chamado.value || chamado;

    // só abre o modal depois que tudo foi carregado
    dialogDescricao.value = true;
  } finally {
    loading.value = false;
  }
};

// Busca dados da API
const fetchData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const result = await chamadosStore.fetchChamados();

    if (!result.success) {
      throw new Error(result.message || "Falha ao carregar chamados");
    }

    chamados.value = result.data || [];
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
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<style scoped>
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
  gap: 9px;
}

/* .chamado-card {
  border-radius: 10px;
  background: #2d3748;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.25s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.05);
} */
.chamado-card {
  border-radius: 10px;
  background: #2d3748;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.25s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  min-height: 80px; /* ✅ Altura mínima para evitar cards muito curtos */
}

.chamado-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  background: #333f50;
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

/* .badge-local {
  background: linear-gradient(135deg, #FF6B35, #FF8E53);
  font-size: 0.75rem;
  max-width: 200px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
} */

/* .chamado-descricao {
  min-height: 48px;
  display: flex;
  align-items: center;
} */

/* .line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
} */

.descricao-completa {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
}

/* .modal-completo {
  min-width: 90vw;
  max-width: 1000px;
} */
.filtros-section {
  background: rgba(255, 255, 255, 0.03);
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
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
