<template>
  <div class="q-pa-md">
    <!-- Filtros -->
    <div class="row q-gutter-md q-mb-md items-center">
      <q-input
        dark
        dense
        outlined
        debounce="300"
        v-model="filter"
        placeholder="Buscar por cliente/unidade"
        clearable
        class="col"
        :prefix="filter ? '🔎' : ''"
      />


      <q-btn
        label="Limpar Filtros"
        @click="limparFiltros"
        flat
        dense
        color="white"

        class="q-mt-md"
      />
    </div>

    <q-table
      title="Unidades com servidor local"
      caption="Lista de Unidade com servidor local"
      :rows="filteredRows"
      :columns="columns"
      row-key="Id"
      flat
      bordered
      dense
      :no-data-label="'Nenhum totem encontrado.'"
      :no-results-label="'Nenhum resultado encontrado.'"
      :pagination="{ sortBy: 'pendencies', descending: true, rowsPerPage: 0 }"
    >
      <!-- Online -->
      <template #body-cell-online="props">
        <q-td :props="props" align="center">
          <q-icon
            :name="props.row.Status === 1 ? 'check_circle' : 'cancel'"
            :color="props.row.Status === 1 ? 'green' : 'red'"
            size="md"
          />
          <q-tooltip>
            Equipamento {{ props.row.Status === 1 ? "Online" : "Offline" }}
          </q-tooltip>
        </q-td>
      </template>

      <!-- Cliente / Estação -->
    <template #body-cell-client_station="props">
  <q-td :props="props">

   <div
  class="row items-start"
  :class="$q.screen.lt.md ? 'column' : 'items-center justify-between'"
  style="width: 100%"
>


      <!-- Cliente + Estação (mantém em coluna exatamente como está) -->
      <div class="column">
        <span class="text-weight-bold text-primary flex items-center">
          <q-icon name="store" size="16px" color="primary" class="q-mr-xs" />
          {{ props.row.ClientName || "—" }}
        </span>

        <span class="text-grey-7 text-caption flex items-center">
          <q-icon name="computer" size="14px" color="grey-6" class="q-mr-xs" />
          {{ props.row.Name || "—" }}
        </span>
      </div>

      <!-- 🔵 Botões lado direito -->
    <!-- 🔵 Botões lado direito (desktop) / abaixo (mobile) -->
<div
  class="row items-center q-gutter-sm"
  :class="$q.screen.lt.md ? 'q-mt-sm justify-center full-width' : 'justify-end'"
>
  <q-btn
    size="sm"
    color="primary"
    label="TABLESPACES"
    @click="abrirResume(props.row)"
    outline
    icon="storage"
  />

  <q-btn
    size="sm"
    color="secondary"
    outline
    label="APIs"
    icon="link"
    @click="abrirApis(props.row)"
  />
</div>

    </div>

  </q-td>
</template>



      <!-- Pendências -->
      <template #body-cell-pendencies="props">
        <q-td :props="props" align="center">
          <q-badge
         flat

            :color="(props.row.ReplicationQueue?.Pendencies ?? 0) > 10 ? 'red' : 'green'"
            class="text-body2"
          >
            <!-- {{ props.row.ReplicationQueue?.Pendencies ?? 0 }} -->
               {{
        (props.row.ReplicationQueue?.Pendencies ?? 0) > 10
          ? props.row.ReplicationQueue.Pendencies
          : 0
      }}

          </q-badge>
        </q-td>
      </template>



      <!-- Disco Host (Gauge) -->
      <template #body-cell-HostDisk="props">
        <q-td :props="props" align="center">
          <q-circular-progress
            :value="getPercent(props.row.HostDisk) * 100"
            size="70px"
            :thickness="0.2"
            :color="getColor(props.row.HostDisk)"
            track-color="grey-4"
            angle-start="-90"
            show-value
            class="q-ma-sm text-weight-bold"
          >
            <div class="text-body2">{{ props.row.HostDisk || "0%" }}</div>
          </q-circular-progress>
          <q-tooltip
            >Uso de disco do host: {{ props.row.HostDisk || "0%" }}</q-tooltip
          >
        </q-td>
      </template>

      <!-- Disco BD (Gauge) -->
      <template #body-cell-DBDisk="props">
        <q-td :props="props" align="center">
          <q-circular-progress
            :value="getPercent(props.row.DBDisk) * 100"
            size="70px"
            :thickness="0.2"
            :color="getColor(props.row.DBDisk)"
            track-color="grey-4"
            angle-start="-90"
            show-value
            class="q-ma-sm text-weight-bold"
          >
            <div class="text-body2">{{ props.row.DBDisk || "0%" }}</div>
          </q-circular-progress>
          <q-tooltip
            >Uso de disco do BD: {{ props.row.DBDisk || "0%" }}</q-tooltip
          >
        </q-td>
      </template>

      <!-- Data formatada -->
      <template #body-cell-date="props">
        <q-td :props="props" align="center">
          <span class="text-caption text-grey-8">
            {{ formatDate(props.row.UploadDate) }}
          </span>
        </q-td>
      </template>
    </q-table>
  </div>

<q-dialog v-model="resumeDialog">
  <q-card
    class="bg-grey-5 text-black"
    :class="$q.screen.lt.md ? 'q-pa-sm mobile-dialog' : ''"
    :style="$q.screen.lt.md ? 'width: 100%; max-width: 95vw' : 'min-width: 700px'"
  >
    <q-card-section class="text-h6">Tablespaces</q-card-section>

    <q-card-section>
      <q-table
        flat
        bordered
        dense
        hide-bottom
        :rows="tbsRows"
        :columns="tbsColumns"
        row-key="name"
        :pagination="{ rowsPerPage: 0 }"
      />
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Fechar" color="red" v-close-popup />
    </q-card-actions>
  </q-card>
</q-dialog>


<q-dialog v-model="showApiModal">
  <q-card
    class="bg-grey-5 text-black"
    :class="$q.screen.lt.md ? 'q-pa-sm mobile-dialog' : ''"
    :style="$q.screen.lt.md ? 'width: 100%; max-width: 95vw' : 'width: 700px'"
  >
    <q-card-section class="text-h6 text-weight-bold">
      Endpoints das APIs
    </q-card-section>

    <q-card-section>
      <q-table
        flat
        bordered
        dense
        hide-bottom
        :rows="apiRows"
        :columns="apiColumns"
        row-key="name"
        :pagination="{ rowsPerPage: 0 }"
      />
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Fechar" color="primary" v-close-popup />
    </q-card-actions>
  </q-card>
</q-dialog>

</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  data: Array,
});

const filter = ref("");
const filtroStatus = ref(null);
const filtroPendencias = ref(null);
const filtroConsumo = ref("todos");

const resumeDialog = ref(false);
const resumeTexto = ref("");

const tbsRows = ref([]);
const tbsColumns = [
  { name: "name", label: "Tablespace", field: "name", align: "left" },
  { name: "size", label: "Tamanho", field: "size", align: "center" },
  { name: "used", label: "Usado", field: "used", align: "center" },
  { name: "free", label: "Livre", field: "free", align: "center" },
  { name: "pct", label: "% Livre", field: "pct", align: "center" },
];



const showApiModal = ref(false);
const apiRows = ref([]);

function abrirApis(row) {
  const texto = row.Resume || row.resume || "";
  apiRows.value = extractApis(texto);
  showApiModal.value = true;
}

const apiColumns = [
  { name: "name", label: "Nome", field: "name", align: "left" },
  { name: "url", label: "URL", field: "url", align: "left" },
];

function extrairTablespaces(resume) {
  if (!resume) return [];

  const lines = resume
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.includes("|"));

  // Filtra apenas as linhas no formato das tablespaces (5 colunas)
  const tbs = lines
    .map((l) => l.split("|").map((p) => p.trim()))
    .filter((p) => p.length === 5) // garante estrutura correta
    .map((p) => ({
      name: p[0],
      size: p[1],
      used: p[2],
      free: p[3],
      pct: p[4],
    }));

  return tbs;
}


function abrirResume(row) {
  const texto = row.Resume || row.resume || "";

  // Extrai TBS
  tbsRows.value = extrairTablespaces(texto);

  resumeDialog.value = true;
}


const columns = [
  {
    name: "online",
    label: "Online",
    field: "Status",
    align: "center",
    sortable: true,
  },
  {
    name: "client_station",
    label: "Cliente / Estação",
    align: "left",
    field: (row) => `${row.ClientName || ""} - ${row.Name || ""}`,
  },
  {
    name: "pendencies",
    label: "Pendências replicação",
    field: (row) => row.ReplicationQueue?.Pendencies || 0,
    align: "center",
    sortable: true,
    sortMethod: (a, b) => b - a,
  },
  {
    name: "HostDisk",
    label: "Disco Host",
    field: "HostDisk",
    align: "center",
    sortable: true,
  },
  {
    name: "DBDisk",
    label: "Disco BD",
    field: "DBDisk",
    align: "center",
    sortable: true,
  },
  {
    name: "date",
    label: "Última Atualização",
    field: "UploadDate",
    align: "center",
    sortable: true,
  },
];

// Opções para os filtros
const opcoesStatus = [
  { label: "Online", value: 1 },
  { label: "Offline", value: 0 },
];

const opcoesPendencias = [
  { label: "Com Pendências", value: "com" },
  { label: "Sem Pendências", value: "sem" },
];

const opcoesConsumo = [
  { label: "Todos", value: "todos" },
  { label: "Mais Consumo Host", value: "mais-host" },
  { label: "Mais Consumo BD", value: "mais-bd" },
  { label: "Menos Consumo Host", value: "menos-host" },
  { label: "Menos Consumo BD", value: "menos-bd" },
];

// Função para converter porcentagem para número
function getPercent(value) {
  if (!value) return 0;
  const num = parseFloat(String(value).replace("%", "").trim());
  return isNaN(num) ? 0 : num / 100;
}

// Função para obter valor numérico do disco
function getDiskValue(value) {
  if (!value) return 0;
  const num = parseFloat(String(value).replace("%", "").trim());
  return isNaN(num) ? 0 : num;
}

// Função para verificar se tem pendências
function temPendencias(row) {
  return (row.ReplicationQueue?.Pendencies || 0) > 0;
}

const getModelValue = (model) => {
  // Se recebeu o objeto { label, value } devolve .value, senão devolve o próprio model
  if (model && typeof model === "object" && "value" in model)
    return model.value;
  return model;
};

// const apiList = extractApis(item.Resume);

function extractApis(resume) {
  const regex = /(\S+)\s*\|\s*(?:\[.*?\]|Falha|NotFound)\s*\|\s*(\S+)/g;
  const apis = [];
  let match;

  while ((match = regex.exec(resume)) !== null) {
    apis.push({
      name: match[1],
      url: match[2]
    });
  }

  return apis;
}

const filteredRows = computed(() => {
  let rows = [...(props.data || [])];

  // DEBUG - verifique se os modelos estão recebendo o que esperamos
  // console.log('DEBUG filtros raw:', { filter: filter.value, filtroStatus: filtroStatus.value ?? filtroStatus, filtroPendencias: filtroPendencias.value ?? filtroPendencias, filtroConsumo: filtroConsumo.value ?? filtroConsumo })

  // 🔍 Filtro de busca
  if (filter.value) {
    const f = filter.value.toLowerCase();
    rows = rows.filter((r) => {
      const combined = `${r.ClientName || ""} ${r.Name || ""}`.toLowerCase();
      return combined.includes(f);
    });
  }

  // ✅ Filtro por status (lida com value ou object)
  const statusVal = getModelValue(filtroStatus.value ?? filtroStatus);
  if (
    statusVal !== null &&
    statusVal !== undefined &&
    String(statusVal) !== ""
  ) {
    rows = rows.filter((row) => Number(row.Status) === Number(statusVal));
  }

  // ✅ Filtro por pendências
  const pendVal = getModelValue(filtroPendencias.value ?? filtroPendencias);
  if (pendVal) {
    if (String(pendVal) === "com") {
      rows = rows.filter((row) => (row.ReplicationQueue?.Pendencies || 0) > 0);
    } else if (String(pendVal) === "sem") {
      rows = rows.filter(
        (row) => (row.ReplicationQueue?.Pendencies || 0) === 0
      );
    }
  }

  // ✅ Ordenação por consumo de disco (sem interferir no sort da tabela)
  const consVal = getModelValue(filtroConsumo.value ?? filtroConsumo);
  if (consVal && String(consVal) !== "todos") {
    const sorters = {
      "mais-host": (a, b) =>
        getDiskValue(b.HostDisk) - getDiskValue(a.HostDisk),
      "menos-host": (a, b) =>
        getDiskValue(a.HostDisk) - getDiskValue(b.HostDisk),
      "mais-bd": (a, b) => getDiskValue(b.DBDisk) - getDiskValue(a.DBDisk),
      "menos-bd": (a, b) => getDiskValue(a.DBDisk) - getDiskValue(b.DBDisk),
    };
    const sorter = sorters[String(consVal)];
    if (sorter) rows.sort(sorter);
  }

  return rows;
});

const limparFiltros = () => {
  filter.value = "";
  filtroStatus.value = null;
  filtroPendencias.value = null;
  filtroConsumo.value = "todos";
};

// Formata datas
function formatDate(dateString) {
  if (!dateString || dateString === "-" || dateString === "0001-01-01T00:00:00")
    return "Sem dados";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Sem dados";
  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// Define cor do gauge
function getColor(value) {
  const pct = getPercent(value) * 100;
  if (pct >= 90) return "negative";
  if (pct >= 75) return "warning";
  return "positive";
}

watch(filteredRows, (val) => {
  console.log("Filtro aplicado:", val.length, "totens encontrados");
});
</script>

<style scoped>
.q-circular-progress {
  transition: transform 0.3s ease;
}
.q-circular-progress:hover {
  transform: scale(1.15);
}

.q-select {
  min-width: 180px;
}
</style>
