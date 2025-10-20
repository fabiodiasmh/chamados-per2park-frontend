<template>
  <q-page class="dashboard-page">
    <div class="container">
      <!-- Header Compacto -->


      <div class="text-subtitle1 text-weight-bold text-white q-mb-xs">
  Quantidade: {{ chamadosFiltrados.length }} • Atualizado: {{ lastUpdate }}
</div>

<div class="filtros-section q-mb-md">
  <div class="row q-gutter-sm">
    <!-- Busca por número do chamado -->
    <q-input
      v-model="filtroNumeroChamado"
      dense
      outlined
      placeholder="Nº do chamado"
      class="col-12 col-sm-6 col-md-2"
      input-class="text-white"
      bg-color="dark"
      type="text"
    >
      <template v-slot:prepend>
        <q-icon name="tag" color="grey-5" />
      </template>
    </q-input>

    <!-- Busca geral -->
    <q-input
      v-model="filtroTexto"
      dense
      outlined
      dark
      color="blue-4"
      placeholder="Buscar por local, descrição..."
      class="col-12 col-sm-6 col-md"
      input-class="text-white"
      bg-color="dark"
    >
      <template v-slot:prepend>
        <q-icon name="search" color="grey-5" />
      </template>
    </q-input>

    <!-- Filtro de Status -->
    <q-select
      v-model="filtroStatus"
      :options="opcoesStatus"
      dense
      outlined
      dark
      color="blue-4"
      emit-value
      map-options
      class="col-12 col-sm-6 col-md-3"
      input-class="text-white"
      bg-color="dark"
      options-dark
      popup-content-class="bg-dark text-white"
      placeholder="Status"
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
      class="col-12 col-sm-6 col-md-2"
      input-class="text-white"
      bg-color="dark"
      options-dark
      popup-content-class="bg-dark text-white"
      placeholder="Ordenar"
    />

    <!-- Botão Limpar -->
    <div class="col-12 col-md-auto flex flex-center q-mt-sm q-md-mt-0">
      <q-btn
        dense
        flat
        icon="clear"
        color="grey-5"
        @click="limparFiltros"
        title="Limpar todos os filtros"
        class="full-width full-md-width"
      >
        <q-tooltip>LIMPAR FILTROS</q-tooltip>
      </q-btn>
    </div>
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
  v-if="!loading && !error && chamadosFiltrados && chamadosFiltrados.length > 0"
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
     <!-- Cabeçalho do Chamado -->
<div class="chamado-header">
  <div class="chamado-header-content">
    <!-- Linha 1: ID + Data -->
    <div class="chamado-linha">
      <span class="text-subtitle1 text-blue-3">
        {{ chamado.Id }} •
        <q-icon name="schedule" color="white-8" size="16px" class="q-ml-xs" />
        {{ formatarData(chamado.OpeningDate) }}
      </span>
    </div>

    <!-- Linha 2: Status + Local -->
    <div class="chamado-linha">
      <q-badge
        :color="getStatusColor(chamado.Status)"
        text-color="white"
        size="xs"
        class="q-mr-xs"
        style="line-height: 1.2; padding: 2px 6px; font-size: 0.72rem;"
      >
        {{ getStatusLabel(chamado.Status) }}
      </q-badge>
      <span class="text-orange-4 text-weight-medium text-body1">
        {{ chamado.Local?.Name || "Local não informado" }}
      </span>
    </div>

    <!-- Linha 3: Categoria -->
    <div class="text-blue-1 chamado-linha chamado-categoria">
      {{ chamado.Category?.Name || "—" }}
    </div>
  </div>
</div>

      <!-- Descrição -->
      <div class="q-py-sm">
        <div class="text-body1 text-grey-2 line-clamp-3">
          {{ chamado.Description }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</div>
    </div>

    <!-- Modal com detalhes do chamado -->
<q-dialog v-model="dialogDescricao" seamless>
  <q-card class="modal-completo q-pa-none" style="width: 95vw; max-width: 1000px; max-height: 90vh;">
    <!-- Cabeçalho com botão de fechar fixo no canto superior direito -->
    <q-card-section class="relative-position">
      <div class="row justify-between items-start q-gutter-xs">
        <!-- Local -->
        <div class="col-12 col-sm-4 text-body2">
          <q-icon name="location_on" color="primary" size="24px" class="q-mr-sm" />
          <span class="text-subtitle1">
            {{ chamadoSelecionado?.Local?.Name || "Local não informado" }}
          </span>
        </div>

        <!-- Status -->
        <div class="col-12 col-sm-auto text-center q-mt-xs q-sm-mt-0">
          <q-badge
            :color="getStatusColor(chamadoSelecionado?.Status)"
            text-color="white"
            size="xs"
          >
            {{ getStatusLabel(chamadoSelecionado?.Status) }}
          </q-badge>
        </div>

        <!-- ID do chamado -->
        <div class="col-12 col-sm-2 text-subtitle1 text-center q-mt-xs q-sm-mt-0">
          Chamado #{{ chamadoSelecionado?.Id }}
        </div>

        <!-- Data de abertura -->
        <div class="col-12 col-sm-auto text-body2 text-center q-mt-xs q-sm-mt-0">
          <q-icon name="schedule" color="orange-8" size="18px" class="q-mr-xs" />
          Aberto: {{ formatarData(chamadoSelecionado?.OpeningDate) }}
        </div>
      </div>

      <!-- Botão de fechar fixo no canto superior direito (sempre visível) -->
      <q-btn
        dense
        flat
        icon="close"
        v-close-popup
        round
        color="grey-6"
        class="absolute-top-right"
        style="top: 8px; right: 8px; z-index: 10;"
      />
    </q-card-section>

    <q-separator />

    <!-- Corpo com scroll interno -->
    <q-card-section class="scroll" style="max-height: 65vh; overflow-y: auto;">
      <div class="column q-gutter-sm">
        <!-- Contato -->
        <div class="col-12">
          <div class="row items-center flex-wrap q-gutter-x-sm q-gutter-y-xs text-body1">
            <div class="row items-center">
              <q-icon name="fas fa-user-circle" size="18px" class="q-mr-xs" style="color: #666" />
              <span class="text-weight-medium">{{ chamadoSelecionado?.ContactName || "—" }}</span>
            </div>

            <div v-if="chamadoSelecionado?.ContactPhone" class="row items-center">
              <a
                @click.prevent="abrirWhatsApp(chamadoSelecionado.ContactPhone)"
                style="cursor: pointer; display: inline-flex; align-items: center; text-decoration: none; color: #25d366;"
              >
                <q-icon name="fab fa-whatsapp" size="18px" class="q-mr-xs" />
                <span>{{ chamadoSelecionado.ContactPhone }}</span>
              </a>
            </div>
            <div v-else class="row items-center">
              <q-icon name="fab fa-whatsapp" size="18px" class="q-mr-xs" style="color: #25d366; opacity: 0.5" />
              <span>—</span>
            </div>

            <div class="row items-center">
              <q-icon name="mail" color="red-8" size="18px" class="q-mr-xs" />
              <span class="text-blue-9">{{ chamadoSelecionado?.ContactMail || "—" }}</span>
            </div>
          </div>
        </div>

        <!-- Descrição -->
        <div class="col-12">
          <div class="text-caption text-grey-7 q-mb-xs">Descrição</div>
          <q-card flat bordered class="bg-grey-1">
            <q-card-section class="q-pa-sm text-body2">
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
              color="grey-3"
              text-color="grey-9"
              icon="devices"
              class="text-weight-medium"
            >
              {{ equip.Name }}
            </q-chip>
          </div>
        </div>

        <!-- Ações Rápidas -->
        <div class="col-12 q-mt-md">
          <div class="text-caption text-grey-7 q-mb-xs">Ações</div>
          <div class="row wrap q-gutter-sm justify-center">
            <q-btn
              size="sm"
              color="orange"
              icon="photo_camera"
              label="Pedir evidência"
              @click="abrirPromptAtualizacao(9, 'enviar evidencias no Whatsapp','Pedir evidência')"
              dense
              class="mobile-full-width"
            />
            <q-btn
              size="sm"
              color="red"
              icon="done_all"
              label="Pedir validação"
              @click="abrirPromptAtualizacao(9, 'efetuado ajustes, favor verificar e validar.', 'Pedir validação')"
              dense
              class="mobile-full-width"
            />
            <q-btn
              size="sm"
              color="teal"
              icon="inventory"
              label="Solicitar nº série"
              @click="abrirPromptAtualizacao(9, 'informar numero de serie do(s) equipamento(s).','Solicitar nº série')"
              dense
              class="mobile-full-width"
            />
            <q-btn
              size="sm"
              color="blue"
              icon="engineering"
              label="Em atendimento"
              @click="abrirPromptAtualizacao(2, 'o chamado foi recepcionado e está na fila de atendimento.','Em atendimento')"
              dense
              class="mobile-full-width"
            />
            <q-btn
              size="sm"
              color="brown"
              icon="build"
              label="Assistência técnica"
              @click="abrirPromptAtualizacao(11, 'encaminhado para assistência técnica OS: ','Assistência técnica')"
              dense
              class="mobile-full-width"
            />

             <q-btn
              size="sm"
              color="purple-4"
              icon="build"
              label="Encaminhar Nível 2"
              @click="abrirPromptAtualizacao(12, 'encaminhado nivel 2.','Encaminhar Nível 2')"
              dense
              class="mobile-full-width"
            />

             <q-btn
              size="sm"
              color="blue-10"
              icon="build"
              label="Encaminhar Nível 3"
              @click="abrirPromptAtualizacao(10, 'encaminhado nivel 3.','Encaminhar Nível 3')"
              dense
              class="mobile-full-width"
            />
            <q-btn
              size="sm"
              color="green"
              icon="check_circle"
              label="Fechar chamado"
              @click="abrirPromptAtualizacao(5, 'chamado resolvido e finalizado.','Fechar chamado')"
              dense
              :disable="true"
              class="mobile-full-width"
            />
          </div>
        </div>

        <!-- Histórico de Atendimento -->
        <div class="col-12" v-if="chamadoSelecionado?.HistoryCalls?.length">
          <div class="text-caption text-grey-7 q-mt-md q-mb-xs">Histórico de Atendimento</div>
          <q-timeline color="primary" class="q-mt-sm">
            <q-timeline-entry
              v-for="(hist, index) in chamadoSelecionado.HistoryCalls"
              :key="index"
              :title="hist.User?.Name || 'Sistema'"
              :subtitle="formatarData(hist.Date)"
              icon="chat"
              icon-color="primary"
            >
              <div class="text-caption text-grey-8">Status: {{ getStatusLabel(hist.Status) }}</div>
              <div class="text-body2 q-mt-xs">{{ hist.Description || "Sem descrição" }}</div>
            </q-timeline-entry>
          </q-timeline>
        </div>
      </div>
    </q-card-section>

    <!-- Rodapé -->
    <q-separator />
    <q-card-actions align="center" class="q-py-md">
      <q-btn label="Fechar" color="primary" outline v-close-popup class="mobile-full-width" />
    </q-card-actions>
  </q-card>
</q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useQuasar } from "quasar";
const $q = useQuasar();
import { useChamadosStore } from "stores/chamados";

const chamadosStore = useChamadosStore();

const chamados = ref([]);
const detalhe_chamado = ref([]);
const loading = ref(true);
const error = ref(null);
const lastUpdate = ref("");
const dialogDescricao = ref(false);
const chamadoSelecionado = ref(null);
let intervalId = null;

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
  // { label: "Fechado", value: 5 },
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

// 1. Primeiro, declare a função
const getSaudacao = () => {
  const hora = new Date().getHours()
  if (hora >= 5 && hora < 12) {
    return 'Bom dia'
  } else if (hora >= 12 && hora < 18) {
    return 'Boa tarde'
  } else {
    return 'Boa noite'
  }
}

// 2. Depois, use-a
const saudacao = ref(getSaudacao())

const formatarNumeroWhatsApp = (numero) => {
  let soNumeros = numero.replace(/\D/g, "");
  if (soNumeros.startsWith("0")) soNumeros = soNumeros.substring(1);
  if (!soNumeros.startsWith("55")) soNumeros = "55" + soNumeros;
  return soNumeros;
};

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
const abrirPromptAtualizacao = (novoStatus, placeholderTexto,selecionado) => {

  console.log('saudacao.value:', saudacao.value);
console.log('placeholderTexto:', placeholderTexto);
  $q.dialog({
    title: selecionado,
     message: "Descreva brevemente a ação realizada:",

    prompt: {
      model: saudacao.value + ", " + placeholderTexto,
      type: "textarea",
      // isValid: (val) => val && val.trim().length > 0,
      isValid: val => val?.trim().length > 0
    },
    cancel: true,
    persistent: false,
    ok: "OK",
    cancel: "Cancelar",
  }).onOk(async (descricao) => {
     try {
      // 1. Atualiza o status no backend (via store)
      const result = await chamadosStore.atualizarStatusNoStore(novoStatus, descricao.trim());

      // if (!result?.success) throw new Error("Falha ao atualizar");

      // 2. Recarrega os detalhes ATUALIZADOS
      const detalhesAtualizados = await chamadosStore.fetchDetalheChamados(chamadoSelecionado.value.Id);

      if (detalhesAtualizados?.success && detalhesAtualizados.data) {
        // 3. Atualiza o objeto do modal REATIVAMENTE
        chamadoSelecionado.value = { ...detalhesAtualizados.data };
      }

      $q.notify({
        type: "positive",
        message: "Status atualizado com sucesso!",
        icon: "check",
        timeout: 2000,
      });

    } catch (error) {
      $q.notify({
        type: "negative",
        message: "Erro ao atualizar o status. Tente novamente.",
        icon: "error",
        timeout: 3000,
      });
      console.error("Erro:", error);
    }

    // //  console.log("OK clicado, descrição:", descricao);


    // try {
    //   await atualizarStatusChamado(novoStatus, descricao.trim());
    //   // Notificação de sucesso
    //   $q.notify({
    //     type: "positive",
    //     message: "Status atualizado com sucesso!",
    //     icon: "check",
    //     timeout: 2000,
    //   });

    // await  fetchDetalhesChamadoData(chamadoSelecionado.value.Id)
    // } catch (error) {
    //   // Opcional: tratar erro com notificação
    //   $q.notify({
    //     type: "negative",
    //     message: "Erro ao atualizar o status. Tente novamente.",
    //     icon: "error",
    //     timeout: 3000,
    //   });
    //   console.error("Erro ao atualizar status:", error);
    // }

  });
};

const atualizarStatusChamado = async (novoStatus, descricao) => {
  if (!chamadoSelecionado.value?.Id) return;

  chamadosStore.atualizarStatusNoStore(novoStatus, descricao);

  console.log(chamadosStore.detalhe_chamado);


};

// Formata data para exibição amigável
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
const mostrarDescricaoCompleta = async (chamado) => {
  dialogDescricao.value = true;
  console.log("Chamado selecionado:", chamado);

  // Primeiro, busca os detalhes atualizados
  chamadoSelecionado.value = chamado;
  var teste = await fetchDetalhesChamadoData(chamado.Id); // 👈 passa o ID
  console.log("Detalhes do chamado carregados:", detalhe_chamado.value);
  chamadoSelecionado.value = detalhe_chamado.value;
  console.log(chamado.Id);
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
  saudacao.value = getSaudacao(); // define inicialmente

  intervalId = setInterval(() => {
    saudacao.value = getSaudacao();
    fetchData();
  }, 180000); // a cada 3 minutos
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<style scoped>

/* Importa a fonte Inter do Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

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
  padding: 15px;
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
  gap: 15px;
}

.chamado-card {
  border-radius: 10px;
  background: #354155;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.25s ease;
  cursor: pointer;
  border: 1px solid white;
  display: flex;
  flex-direction: column;
  min-height: 80px; /* ✅ Altura mínima para evitar cards muito curtos */
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chamado-card:hover {
  transform: translateY(-0px);
  box-shadow: 0 0 13px 3px orange;
  background: #333f50;
}

.chamado-header {
  /* display: flex; */
  /* align-items: center; ✅ Alinha todos os filhos verticalmente ao centro */
  /* justify-content: center ; */
  /* gap: 500px; */
  padding: 0px 0px;
  border-bottom: 2px solid rgba(202, 198, 198, 0.08);
  min-height: 40px; /* ✅ Altura mínima fixa para alinhar todos os cards */
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

.testee {
  flex: 1 1 auto;
  min-width: 0; /* ✅ Permite que o texto seja truncado */
  justify-content: center;
}

/* Nome do local: não quebra linha, trunca se necessário */
.chamado-nome-local {
  /* white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 4px; pequeno espaçamento após a badge */
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

/* .modal-completo {
  min-width: 90vw;
  max-width: 1000px;
} */
.filtros-section {
  background: rgba(255, 255, 255, 0.03);
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.chamado-header {
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.chamado-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.chamado-linha {
  /* display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap; */
}

.chamado-categoria {
  color: var(--q-color-blue-3);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: right;
  min-width: fit-content;
}
/* Responsividade */
/* Ajustes apenas para mobile */
@media (max-width: 767px) {
  .mobile-full-width {
    width: 100% !important;
    margin-bottom: 10px !important;

  }

    .modal-completo .absolute-top-right {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chamado-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .chamado-linha {
    width: 100%;
    justify-content: flex-start;
  }

  .chamado-categoria {
    text-align: left;
    font-size: 0.875rem;
  }

  /* Evita que o badge fique muito pequeno */
  .chamado-linha .q-badge {
    font-size: 0.75rem !important;
  }

   .full-md-width {
    max-width: 200px;
    margin: 0 auto;
  }

  .chamado-header-row {
    flex-direction: column;
    gap: 4px;
  }

  .chamado-header-row > div {
    width: 100% !important;
    text-align: left !important;
  }

  /* Força categoria à esquerda em mobile */
  .chamado-header-row > div:last-child {
    text-align: left !important;
  }

  /* Garante que o ícone do WhatsApp e e-mail não fiquem apertados */
  .modal-completo .row.items-center.text-body2 {
    flex-wrap: wrap;
    gap: 4px 8px;
  }

  /* Melhora o espaçamento do cabeçalho em mobile */
  .modal-completo .q-card__section:first-child .row {
    flex-direction: column;
    align-items: flex-start;
  }

  .modal-completo .q-card__section:first-child .col-12.col-sm-4,
  .modal-completo .q-card__section:first-child .col-12.col-sm-2,
  .modal-completo .q-card__section:first-child .col-12.col-sm-auto {
    width: 100% !important;
    text-align: left !important;
  }

  .modal-completo .q-card__section:first-child .col-12.col-sm-auto:last-child {
    text-align: right !important;
  }

  /* Evita que o modal fique muito alto em mobile */
  .modal-completo {
    max-height: 90vh;
    overflow-y: auto;
  }
}
</style>
