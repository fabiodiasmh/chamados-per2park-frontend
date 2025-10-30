import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { store } from 'quasar/wrappers';

import { useAuthStore } from 'stores/auth' // outro store

export const useChamadosStore = defineStore('chamados', {
  state: () => ({
    chamados: [],
    detalhe_chamado:{},
    chamadosPorStatus: {},
    topLocais: [],
    retorno_status: [],
    loading: false,
    error: null
  }),

  actions: {

    async atualizarStatusNoStore(novoStatus, descricao) {
      const authStore = useAuthStore()

        // 🔴 Validação crítica
  if (!this.detalhe_chamado?.Id) {
    console.error('ID do chamado ausente!', this.detalhe_chamado)
    return { success: false, message: 'Chamado inválido: ID não encontrado' }
  }

  // 🔴 Garanta que authStore.usuario tem Id
  if (!authStore.usuario?.Id) {
    console.error('Usuário sem ID!', authStore.usuario)
    return { success: false, message: 'Usuário não autenticado corretamente' }
  }


  // ✅ Atualize mantendo todos os campos originais + novos valores
  const payload = {
    ...this.detalhe_chamado, // preserva Id, ParkingId, etc.
    Status: novoStatus,
    User: {...authStore.usuario}, // ⚠️ confirme se este objeto tem "Id"
    Description: descricao,
    DescriptionUser: descricao,
    HistoryCalls:[]

  }

console.log('Payload para atualização:', payload);

   this.loading = true
      this.error = null
      try {
        console.log('Fetching chamados...')
        const response = await api.put('/update_chamado',payload)
        console.log('PUT update chamado:', payload)
        // this.chamados = response.data || []
        return { data: response.data  }
      } catch (error) {
        this.error = error.response?.data?.message || 'Erro ao buscar chamados'
        console.error('Error fetching chamados:', error)
        console.error('Error response:', error.response)
        return { message: this.error }
      } finally {
        this.loading = false
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
    },

        async satSerie(numeroSerie) {
      this.loading = true
      this.error = null
      try {
        console.log('Fetching locais...')
        const response = await api.get('/sat',{
          params: {
            serie: numeroSerie
          }
        })
        console.log('Locais response:', response)
        this.retorno_status = response.data || []
        return { success: true, data: response.data || [] }
      } catch (error) {
        this.error = error.response?.data?.message || 'Erro ao buscar locais'
        console.error('Error fetching locais:', error)
        console.error('Error response:', error.response)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

         async meus_chamados(dados) {
      this.loading = true
      this.error = null
      try {
        console.log('Fetching locais...')
        const response = await api.post('/insert_usuario',dados)
        console.log('Locais response:', response)
        this.retorno_status = response.data || []
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
