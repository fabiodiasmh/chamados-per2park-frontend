<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" transition-show="scale" transition-hide="scale" class="backdrop-blur">
    <q-card style="max-width: 1100px; width: 92vw; max-height: 92vh; background: #ffffff; border-radius: 20px; box-shadow: 0 12px 40px rgba(0,0,0,0.3);">
      <!-- Cabeçalho -->
      <q-card-section class="row items-center q-pb-sm q-pt-md" style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);">
        <q-icon name="support_agent" color="white" size="md" class="q-mr-sm" />
        <div class="text-h5 text-white">Chamado #{{ chamado?.Id }}</div>
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
              <div class="col-12 col-md-6">
                <div class="info-card-white q-pa-md rounded-borders" style="min-height: 120px; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div class="row items-center q-gutter-sm q-mb-sm">
                      <q-icon name="place" color="orange" size="sm" />
                      <div class="text-caption text-grey-9">Local</div>
                    </div>
                    <div class="text-body1 text-weight-medium text-grey-10">{{ chamado?.Local?.Name || "—" }}</div>
                  </div>

                  <div class="row items-center q-gutter-md q-mt-sm">
                    <div class="row items-center text-grey-9">
                       <q-icon name="schedule" size="xs" class="q-mr-xs" />
                       <span class="text-caption">{{ formatarData(chamado?.OpeningDate) }}</span>
                    </div>
                    <q-badge :style="{ backgroundColor: getStatusColor(chamado?.Status) }" :text-color="getStatusTextColor(chamado?.Status)">
                      {{ getStatusLabel(chamado?.Status) }}
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
                  <span class="text-body2 text-weight-medium text-grey-10">{{ chamado?.ContactName || "—" }}</span>
                </div>
                <q-separator vertical />
                <div class="row items-center q-gutter-xs">
                  <q-icon name="email" color="teal" size="sm" />
                  <span class="text-caption text-grey-9">E-mail:</span>
                  <span class="text-body2 text-grey-10">{{ chamado?.ContactMail || "—" }}</span>
                </div>
                <q-separator vertical />
                <div class="row items-center q-gutter-xs">
                  <q-icon name="phone" color="green" size="sm" />
                  <span class="text-caption text-grey-9">Telefone:</span>
                  <a v-if="chamado?.ContactPhone" @click.prevent="abrirWhatsApp(chamado.ContactPhone)" class="cursor-pointer text-positive text-body2 text-weight-medium">
                    <q-icon name="fab fa-whatsapp" size="sm" class="q-mr-xs" />
                    {{ chamado.ContactPhone }}
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
              {{ chamado?.Description || "Sem descrição" }}
            </div>
          </div>

          <!-- Equipamentos (se houver) -->
          <div class="col-12" v-if="chamado?.Equipments?.length">
            <div class="row items-center q-gutter-sm q-mb-sm">
              <q-icon name="devices" color="cyan" size="md" />
              <div class="text-h6 text-grey-10">Equipamentos</div>
            </div>
            <div class="row q-gutter-xs info-card-white q-pa-sm rounded-borders">
              <q-chip
                v-for="equip in chamado.Equipments"
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
          <div class="col-12" v-if="chamado?.HistoryCalls && chamado.HistoryCalls.length > 0">
            <div class="info-card q-pa-sm rounded-borders">
              <q-timeline color="primary" layout="dense" side="right">
                <q-timeline-entry
                  v-for="(hist, index) in chamado.HistoryCalls"
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
          v-if="chamado?.Status == 0"
          color="primary"
          icon="play_arrow"
          label="Atender"
          @click="abrirPromptAtualizacao(2, 'Iniciar atendimento', saudacao() + ' o chamado foi recepcionado e está na fila de atendimento.')"
          unelevated
          class="col"
          :loading="loading"
        />
        <q-btn
          color="primary"
          icon="reply"
          label="Responder"
          @click="abrirPromptAtualizacao(9, 'Resposta', '')"
          unelevated
          class="col"
          :loading="loading"
        />
        <q-btn
          color="positive"
          icon="check_circle"
          label="Finalizar"
          @click="abrirPromptAtualizacao(5, 'Chamado resolvido', 'Chamado encerrado.')"
          unelevated
          class="col"
          :loading="loading"
        />
        <q-btn-dropdown
          color="grey-7"
          label="Mais"
          icon="more_horiz"
          unelevated
          class="col"
          dropdown-icon="expand_more"
          :loading="loading"
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
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useChamadosStore } from 'stores/chamados'
import { useAuthStore } from 'stores/auth'

const props = defineProps({
  modelValue: Boolean,
  chamado: Object
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const $q = useQuasar()
const chamadosStore = useChamadosStore()
const authStore = useAuthStore()

const loading = ref(false)
const loadingSAT = ref(false)
const valor_numero_serie = ref('')
const valor_saida_sat = ref(null)

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

const copiarChamado = () => {
  const texto = `Chamado: ${props.chamado?.Id} - ${
    props.chamado?.Local?.Name || "Local não informado"
  }`;
  navigator.clipboard.writeText(texto);
  $q.notify({
    message: "Copiado!",
    color: "positive",
    position: "top",
    timeout: 1000
  });
};

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
  if (!props.chamado?.Id) return;

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

    // 2. Emite evento para recarregar dados no pai
    emit('refresh');

    // 3. Se necessário, atualizar meus_chamados
    const dados = {
      chamadoId: props.chamado.Id,
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
  }
};
</script>

<style scoped>
.info-card-white {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid #e0e0e0;
}
.timeline-entry-compact {
  margin-bottom: 8px;
}
.backdrop-blur :deep(.q-dialog__backdrop) {
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.4) !important;
}
</style>
