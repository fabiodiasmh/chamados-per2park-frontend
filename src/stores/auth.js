import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
    ip_servidor_store:localStorage.getItem('ip_servidor') || 'localhost',
    portaApi:8080,
    usuario:null,
    token: null,
    loading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated, //&& state.token,
    userEmail: (state) => state.user?.Login || null
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
    if (this.usuario?.UserType?.Id == 2) {
      this.loading = false
      return {
        success: false,
        message: "Faça login com um usuário do tipo Perto/WPS"

      }
      // throw new Error ("Faça login com um usuário do tipo Perto")
    }


        localStorage.setItem('user_data', JSON.stringify(response.data)) // ← salva usuario
        // this.user = credentials
        this.token = response.data?.token || 'session-token'

        // Store in localStorage for persistence
        // localStorage.setItem('auth_token', this.token)
        sessionStorage.setItem('auth_token', this.token)


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

      // Clear localStorage
      localStorage.removeItem('auth_token')


      // localStorage.removeItem('user_data') // ← remove usuario
    },

    // Initialize auth state from localStorage
    initializeAuth() {
      const token = sessionStorage.getItem('auth_token')
      const userData = sessionStorage.getItem('user_data')

      if (token && userData) {
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
