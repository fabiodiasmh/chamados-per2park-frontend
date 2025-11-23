import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { store } from 'quasar/wrappers';

import { useAuthStore } from 'stores/auth' // outro store

export const useChamadosStore = defineStore('chamados', {
  state: () => ({
    chamados: [],
    detalhe_chamado: {},
    chamadosPorStatus: {},
    topLocais: [],
    retorno_status: [],
    loading: false,
    error: null,
    load_meus_chamados: [],
    todosChamados: [],
    meusChamados: [],
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
      // if (!authStore.usuario?.User.Id) {
      //   console.error('Usuário sem ID!', authStore.usuario.User.Id)
      //   return { success: false, message: 'Usuário não autenticado corretamente' }
      // }


      // ✅ Atualize mantendo todos os campos originais + novos valores
      const payload = {
        ...this.detalhe_chamado, // preserva Id, ParkingId, etc.
        Status: novoStatus,
        User: { ...authStore.usuario.User }, // ⚠️ confirme se este objeto tem "Id"
        Description: descricao,
        DescriptionUser: descricao,
        HistoryCalls: []

      }

      console.log('Payload para atualização:', payload);

      this.loading = true
      this.error = null
      console.log("antes entrar no try pra atualizar o chamado");

      try {
        console.log('update chamado')
        const response = await api.put('/update_chamado', payload)
        console.log('PUT update chamado:', payload)
        // this.chamados = response.data || []
        return { data: response.data }
      } catch (error) {
        this.error = error.response?.data?.message || 'Erro ao buscar chamados'
        console.error('Error update chamado:', error)
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
        const response = await api.get('/detalhes_chamado/' + id_chamado)
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
        console.log("direto da api: ", response.data);

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
        const response = await api.get('/sat', {
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
      console.log("inicio insert usuario");

      this.loading = true
      this.error = null
      try {
        console.log('dentro do try insert usuario')
        const response = await api.post('/insert_chamado', dados)
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

    // async carregarChamados() {
    //   const authStore = useAuthStore()

    //   // Garantir que o ID do usuário está disponível
    //   if (!authStore.usuario?.User?.Id) {
    //     console.error("Usuário não possui ID:", authStore.usuario)
    //     this.error = "Usuário inválido."
    //     return { success: false, message: this.error }
    //   }

    //   const payload = {
    //     id: authStore.usuario.User.Id
    //   }

    //   this.loading = true
    //   this.error = null

    //   try {
    //     console.log("Carregando meus chamados...")

    //     const response = await api.post("/load_meus_chamados", payload)

    //     console.log("Meus chamados:", response.data)

    //     this.load_meus_chamados = response.data || []

    //     return { success: true, data: this.load_meus_chamados }

    //   } catch (error) {
    //     this.error = error.response?.data?.message || "Erro ao carregar meus chamados"
    //     console.error("Erro ao carregar meus chamados:", error)
    //     return { success: false, message: this.error }

    //   } finally {
    //     this.loading = false
    //   }
    // }

    async carregarChamados() {
      const authStore = useAuthStore()
      try {
        this.loading = true

        // Fallback: se o usuário não estiver carregado, tenta inicializar
        if (!authStore.usuario) {
          authStore.initializeAuth()
        }

        const usuarioId = authStore.usuario?.User?.Id

        if (!usuarioId) {
          console.error("Usuário não identificado ao carregar chamados")
          return { success: false, message: "Usuário não identificado" }
        }

        const payload = { id: usuarioId }

        //
        // 1 — Carrega os chamados do usuário (resumidos)
        //
        const resResumo = await api.post('/load_meus_chamados', payload)
        const meusChamadosResumidos = resResumo.data || []

        //
        // 2 — Garante que os chamados completos estão carregados
        //
        if (this.chamados.length === 0) {
          await this.fetchChamados()   // ⬅️ AQUI é o segredo!
        }

        const listaChamados = Array.isArray(this.chamados)
          ? this.chamados
          : this.chamados.chamados

        this.meusChamados = meusChamadosResumidos.map(item => {
          // const completo = this.chamados.find(ch => ch.Id == item.chamadoId)
          const completo = this.chamados.find(ch => ch.Id == item.chamadoId)

          // Se não encontrar os detalhes e NÃO for status 5 (Fechado), ignora.
          // Chamados fechados (5) podem não estar na lista principal, mas devem aparecer.
          if (!completo && item.statusId !== 5) return null

          return {
            ...item,
            ...(completo || {})
          }
        }).filter(item => item !== null)


        console.log("this.chamados", this.chamados)
        console.log("this.meusChamados", this.meusChamados)

        return { success: true, data: this.meusChamados }

      } catch (err) {
        console.error('Erro ao carregar chamados:', err)
        return { success: false, message: err.message }
      } finally {
        this.loading = false
      }
    }





  }
})
