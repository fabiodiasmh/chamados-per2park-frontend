import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useMonitorServerStore = defineStore('monitoramentoServer', {
  state: () => ({
    // qtdReplicacao: [],
    // chamadosPorStatus: {},
    // topLocais: [],
    loading: false,
    error: null,
    todas_unidades:[]
  }),

  actions: {
    async fetchReplicacao() {
      this.loading = true
      this.error = null
      try {

        const response = await api.get('/geral')
        console.log('Chamados response replication:', response)
        // this.qtdReplicacao = response.data || []
        // console.log("Replicationn: "+response.data);
this.todas_unidades =response.data
        return { success: true, data: response.data || [] }
      } catch (error) {
        this.error = error.response?.data?.message || 'Erro ao buscar chamados'
        console.error('Error fetching chamados:', error)
        console.error('Error response:', error.response)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },
  }
})
