<template>
  <div class="q-mt-sm tabela">
    <div v-for="equip in replicacaoData" :key="equip.Id" class="q-mb-md">
      <q-card class="bg-grey-10 text-white q-pa-md shadow-2 rounded-xl">

        <!-- Cabeçalho -->
        <q-card-section class="q-pb-sm">
          <div class="text-subtitle1 text-orange-5">
            {{ equip.ClientName }}
          </div>
          <div class="text-caption text-grey-4">
            {{ equip.Name }}
          </div>
        </q-card-section>

        <!-- Tabela -->
        <q-separator color="grey-8" />

        <q-card-section class="q-pa-none q-pt-sm">
          <q-table
            :rows="getTbs(equip.Resume)"
            :columns="columns"
            class="tab"
            hide-pagination
            bordered
            dense
            flat
            row-key="name"
            separator="cell"
            :pagination="{ rowsPerPage: 0 }"
          />
        </q-card-section>

      </q-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// ✅ Props para receber os dados de fora
defineProps({
  replicacaoData: {
    type: Array,
    required: true
  }
})

// ✅ Função para processar os dados
const getTbs = (resume) => {
  if (!resume) return []
  return resume
    .split('\n')
    .filter(line => /^\s*TBS_/.test(line))
    .map(line => {
      const [name, size, used, free, pct] = line.split('|').map(v => v.trim())
      return { name, size, used, free, pct }
    })
}

// ✅ Definição das colunas
const columns = [
  { name: 'name', label: 'Tablespace', field: 'name', align: 'left' },
  { name: 'size', label: 'Tamanho (MB)', field: 'size', align: 'center' },
  { name: 'used', label: 'Usado (MB)', field: 'used', align: 'center' },
  { name: 'free', label: 'Livre (MB)', field: 'free', align: 'center' },
  { name: 'pct', label: '% Livre', field: 'pct', align: 'center' },
]
</script>

<style scoped>
.tab {
  font-size: 12px;
  font-family: "Roboto", sans-serif;
}

.q-card {
  border-radius: 12px;
}

.q-card-section:first-child {
  padding-bottom: 0;
}
</style>
