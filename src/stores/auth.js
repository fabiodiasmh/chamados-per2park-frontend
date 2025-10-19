import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null,
    usuario:null,
    token: null,
    loading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && state.token,
    userEmail: (state) => state.user?.Login || null
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        console.log('Attempting login with:', credentials)
        const response = await api.post('/login', credentials)
        console.log('Login response:', response)

        this.isAuthenticated = true
        this.usuario = response.data

        localStorage.setItem('user_data', JSON.stringify(response.data)) // ← salva usuario
        // this.user = credentials
        this.token = response.data?.token || 'session-token'

        // Store in localStorage for persistence
        localStorage.setItem('auth_token', this.token)


        return {
          success: true,
          data: response.data,
          message: 'Login realizado com sucesso!'
        }
      } catch (error) {
        console.error('Login error:', error)
        this.error = error.response?.data?.message || 'Erro ao fazer login'
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
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')

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
