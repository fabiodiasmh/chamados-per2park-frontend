import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => {



        // ✅ Calcula variáveis ANTES de retornar o estado
    const isDev = process.env.NODE_ENV === 'development'
    const defaultIp = isDev ? 'localhost' : 'dias.app.br'

    return{
    isAuthenticated: false,
    user: null,
    ip_servidor_store: defaultIp,//localStorage.getItem('ip_servidor') || 'localhost',
    portaApi:8080,
    usuario:null,
    token: null,
    loading: false,
    error: null
    }
  },

  getters: {
    isLoggedIn: (state) => state.isAuthenticated, //&& state.token,
    userEmail: (state) => state.user?.Login || null,
     // 🔹 Domínio/base URL dinâmica (opcional, útil para axios)
    baseUrl: (state) => {
      const isLocal = ['localhost', '127.0.0.1', '::1'].includes(state.ip_servidor_store)
      const protocol = isLocal ? 'http' : 'https'
      const porta = isLocal ? `:${state.portaApi}` : ''
      return `${protocol}://${state.ip_servidor_store}${porta}/api/`
    }
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null

      try {




        const response = await api.post('/login', credentials,{ timeout: 5000 })
        console.log('Login response:', response)

        this.isAuthenticated = true
        this.usuario = response.data

        // Validação antes do try, mas sem throw
    if (this.usuario?.User?.UserType?.Id == 2) {
      this.loading = false
      return {
        success: false,
        message: "Utilize usuário do tipo Perto/WPS"

      }
      // throw new Error ("Faça login com um usuário do tipo Perto")
    }


       // ✅ Salva no sessionStorage (não localStorage)
        sessionStorage.setItem('user_data', JSON.stringify(response.data))
        this.token = response.data?.token || 'session-token'
        sessionStorage.setItem('auth_token', this.token)

           // ✅ Garante que o IP atual está salvo
        sessionStorage.setItem('ip_servidor', this.ip_servidor_store)

        return {
          success: true,
          data: response.data,
          message: 'Login realizado com sucesso!'
        }
      } catch (error) {
        console.error('Login error:', error)
        this.error = 'Credenciais invalidas'
        // this.error = error.response?.data?.message || 'Credenciais invalidas'
        console.log(error.response?.data?.message);

        return {
          success: false,
          message: this.error
        }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.isAuthenticated = false
      this.user = null
      this.token = null
      this.error = null

           // ✅ Limpa sessionStorage (não localStorage)
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('user_data')
      // Mantém `ip_servidor` salvo entre sessões (útil!)


      // localStorage.removeItem('user_data') // ← remove usuario
    },

    // Initialize auth state from localStorage
    initializeAuth() {
      const token = sessionStorage.getItem('auth_token')
      const userData = sessionStorage.getItem('user_data')

      // if (token && userData) {
      if ( userData) {
        this.token = token
        // this.user = JSON.parse(userData)
        this.isAuthenticated = true
      }

       if (userData) {
          this.usuario = JSON.parse(userData) // ← restaura usuario
        }
    },

    // Check if user is authenticated
    checkAuth() {
      return this.isAuthenticated && this.token
    }
  }
})
