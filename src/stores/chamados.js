import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { store } from 'quasar/wrappers';

import { useAuthStore } from 'stores/auth' // outro store

export const useChamadosStore = defineStore('chamados', {
  state: () => ({
    chamados: [],
    detalhe_chamado:[],
    chamadosPorStatus: {},
    topLocais: [],
    loading: false,
    error: null
  }),

  actions: {

     atualizarStatusNoStore(novoStatus, descricao) {
      const authStore = useAuthStore()

    // if (this.detalhe_chamado) {
    //   this.detalhe_chamado.Status = novoStatus;

    //    this.detalhe_chamado.User = authStore.usuario
    // }
      if (this.detalhe_chamado) {
    this.detalhe_chamado = {
      ...this.detalhe_chamado,
      Status: novoStatus,
      User: authStore.usuario,
      Description: descricao,
      DescriptionUser:descricao
    };
  }

  },
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
     async fetchDetalheChamados(id_chamado) {
      this.loading = true
      this.error = null
      try {
        console.log('Fetching chamados...')
        const response = await api.get('/detalhes_chamado/'+id_chamado)
        console.log('Detalhe Chamados response:', response)
        this.detalhe_chamado = response.data || []
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
