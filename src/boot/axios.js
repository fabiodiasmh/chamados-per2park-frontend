// import { boot } from 'quasar/wrappers'
// import axios from 'axios'

// import { useAuthStore } from 'stores/auth'
// // Be careful when using SSR for cross-request state pollution
// // due to creating a Singleton instance here;
// // If any client changes this (global) instance, it might be a
// // good idea to move this instance creation inside of the
// // "export default () => {}" function below (which runs individually
// // for each client)
// const api = axios.create({
//   // baseURL: 'http://localhost:8080/api/', // Updated to match your /api base path
//   headers: {
//     'Content-Type': 'application/json'
//   },
//   withCredentials: true // Important for session management
// })

// // Add request interceptor for debugging
// // api.interceptors.request.use(
// //   (config) => {
// //     console.log('Making request to:', config.url)
// //     console.log('Full config:', config)
// //     return config
// //   },
// //   (error) => {
// //     console.error('Request error:', error)
// //     return Promise.reject(error)
// //   }
// // )
// api.interceptors.request.use((config) => {
//   const store = useAuthStore()
//   const ip = store.ip_servidor_store || 'localhost'
//   const porta = store.portaApi || '8080' // opcional
//   config.baseURL = `http://${ip}:${porta}/api/`

//   // console.log('Usando baseURL:', config.baseURL)
//   return config
// }, (error) => {
//   return Promise.reject(error)
// })

// // Add response interceptor for debugging
// api.interceptors.response.use(
//   (response) => {
//     console.log('Response received:', response)
//     return response
//   },
//   (error) => {
//     console.error('Response error:', error)
//     console.error('Error response data:', error.response?.data)
//     return Promise.reject(error)
//   }
// )

// export default boot(({ app }) => {
//   // for use inside Vue files (Options API) through this.$axios and this.$api

//   app.config.globalProperties.$axios = axios
//   // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
//   //       so you won't necessarily have to import axios in each vue file

//   app.config.globalProperties.$api = api
//   // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
//   //       so you can easily perform requests against your app's API
// })

// export { api }


import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { useAuthStore } from 'stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

api.interceptors.request.use((config) => {

   const token = sessionStorage.getItem('auth_token')
  console.log('[AXIOS] Token encontrado:', !!token) // ← log para debug
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    console.warn('[AXIOS] Nenhum token no sessionStorage!')
  }


  const store = useAuthStore()
  config.baseURL = store.baseUrl // ← usa getter `baseUrl`

  // if (store.ip_servidor_store) {
  //   const ip = store.ip_servidor_store

  //   // Detecta ambiente: localhost/127.0.0.1 → dev; demais → produção
  //   const isLocal = ip === 'localhost' || ip === '127.0.0.1'

  //   // Em produção, não inclui porta (usa 443 implícita do HTTPS)
  //   // Em dev, inclui :porta apenas se definida
  //   const porta = isLocal && store.portaApi ? `:${store.portaApi}` : ''

  //   const protocol = isLocal ? 'http' : 'https'

  //   config.baseURL = `${protocol}://${ip}${porta}/api/`
  // }

  return config
}, (error) => Promise.reject(error))

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
