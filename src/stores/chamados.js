import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useChamadosStore = defineStore('chamados', {
  state: () => ({
    chamados: [],
    chamadosPorStatus: {},
    topLocais: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchChamados() {
      this.loading = true
      this.error = null
      try {
        console.log('Fetching chamados...')
        const response = await api.get('/chamados')
        console.log('Chamados response:', response)
        this.chamados = response.data || []
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

    async fetchChamadosPorStatus() {
      this.loading = true
      this.error = null
      try {
        console.log('Fetching status...')
        const response = await api.get('/chamadosPorStatus')
        console.log('Status response:', response)
        this.chamadosPorStatus = response.data || {}
        console.log("direto da api: ",response.data);

        return { success: true, data: response.data || {} }
      } catch (error) {
        this.error = error.response?.data?.message || 'Erro ao buscar status'
        console.error('Error fetching status:', error)
        console.error('Error response:', error.response)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchChamadosByStatus(valor) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/status?valor=${valor}`)
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.message || 'Erro ao buscar chamados por status'
        console.error('Error fetching chamados by status:', error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchTopLocais() {
      this.loading = true
      this.error = null
      try {
        console.log('Fetching locais...')
        const response = await api.get('/locais')
        console.log('Locais response:', response)
        this.topLocais = response.data || []
        return { success: true, data: response.data || [] }
      } catch (error) {
        this.error = error.response?.data?.message || 'Erro ao buscar locais'
        console.error('Error fetching locais:', error)
        console.error('Error response:', error.response)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    }
  }
})
