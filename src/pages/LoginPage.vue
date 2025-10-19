<template>
  <q-page class="login-page">
    <div class="login-container">
      <!-- Background Animation -->
      <div class="background-animation">
        <div class="floating-shapes">
          <!-- <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
          <div class="shape shape-4"></div> -->
          <div class="shape shape-5"></div>
        </div>
      </div>

      <!-- Login Content -->
      <div class="login-content">
        <!-- Logo/Brand -->
        <div class="brand-section">
          <div class="logo-container">
          </div>
          <!-- <div class="text-h3 q-mb-sm brand-title">Per2Park</div> -->
          <!-- <div class="text-subtitle1 brand-subtitle">Sistema de Chamados - Suporte a Estacionamentos</div> -->
        </div>

        <!-- Login Form -->
        <q-card class="login-card">
          <q-img src="wps-perto.jpg"></q-img>
          <q-card-section class="q-pa-xl">
            <!-- <div class="text-h4 text-center q-mb-lg text-primary">Acessar Sistema</div> -->

            <q-form @submit="onSubmit" class="q-gutter-lg">
              <q-input
                v-model="formData.Login"
                label="Login Perto"
                type="email"

                dense
                class="custom-input"
                :rules="[val => !!val || 'E-mail é obrigatório', val => /.+@.+\..+/.test(val) || 'E-mail inválido']"
                lazy-rules
              >
                <template v-slot:prepend>
                  <q-icon name="email" color="primary" />
                </template>
              </q-input>

              <q-input
                v-model="formData.Password"
                label="Senha"
                :type="showPassword ? 'text' : 'password'"

                dense
                class="custom-input"
                :rules="[val => !!val || 'Senha é obrigatória']"
                lazy-rules
              >
                <template v-slot:prepend>
                  <q-icon name="lock" color="primary" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    color="primary"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>

              <q-btn
                type="submit"
                class="login-btn full-width"
                size="md"
                :loading="authStore.loading"
                :disable="authStore.loading"
              >
                <q-icon name="login" class="q-mr-sm" />
                Acessar
              </q-btn>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- Response Display -->
        <q-card v-if="response" class="response-card">
          <q-card-section class="text-center">
            <div class="text-h6 q-mb-md">Resposta</div>
            <div class="text-body1" :class="response.success ? 'text-positive' : 'text-negative'">
              {{ response.message }}
            </div>
            <div v-if="response.data" class="text-caption q-mt-sm">
              Dados: {{ response.data }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'

defineOptions({
  name: 'LoginPage'
});

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

const formData = ref({
  Login: 'portaria@perto.com.br',
  Password: 'perto123'
})

const showPassword = ref(false)
const response = ref(null)

const onSubmit = async () => {
  response.value = null

  const result = await authStore.login(formData.value)

  response.value = {
    success: result.success,
    message: result.success ? 'Login realizado com sucesso!' : result.message,
    data: result.data
  }

  if (result.success) {
    // $q.notify({
    //   type: 'positive',
    //   message: 'Login realizado com sucesso!',
    //   position: 'top'
    // })
    // Redirect to dashboard after successful login
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  } else {
    // $q.notify({
    //   type: 'negative',
    //   message: result.message,
    //   position: 'top'
    // })
  }
}
</script>

<style scoped>
/* Login Page */
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1C2B36 0%, #2C3E50 100%);
  position: relative;
  overflow: hidden;
}

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  z-index: 2;
}

/* Background Animation */
/* .background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
} */

/* .floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  animation: float 8s ease-in-out infinite;
}

.shape-1 {
  width: 70px;
  height: 70px;
  top: 15%;
  left: 10%;
  animation-delay: 0s;
  background: rgba(255, 83, 0, 0.1);
}

.shape-2 {
  width: 100px;
  height: 100px;
  top: 70%;
  right: 20%;
  animation-delay: 2.5s;
}

.shape-3 {
  width: 50px;
  height: 50px;
  top: 85%;
  left: 25%;
  animation-delay: 5s;
  background: rgba(255, 83, 0, 0.08);
}

.shape-4 {
  width: 90px;
  height: 90px;
  top: 5%;
  right: 25%;
  animation-delay: 1.5s;
} */

/* .shape-5 {
  width: 120px;
  height: 120px;
  top: 45%;
  left: 8%;
  animation-delay: 3.5s;
  background: rgba(255, 83, 0, 0.05);
} */

/* Login Content */
.login-content {

 width: 400px;
 /* height: 300px; */
  /* z-index: 3; */
}

/* Brand Section */
/* .brand-section {
  text-align: center;
  margin-bottom: 40px;
  color: #F0F3F4;
}

.logo-container {
  margin-bottom: 20px;
} */

/* .logo-icon {
  color: #FF5300;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  animation: pulse 2s ease-in-out infinite;
} */

/* .brand-title {
  font-weight: 700;
  color: #FFFFFF;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: slideInDown 0.8s ease-out;
} */

/* .brand-subtitle {
  color: #D1D9E0;
  animation: slideInDown 0.8s ease-out 0.2s both;
} */

/* Login Card */
.login-card {
  background: #FFFFFF;
  border-radius: 25px;
  box-shadow: 0 20px 40px rgba(28, 43, 54, 0.2);
  border: 1px solid rgba(240, 243, 244, 0.5);
  animation: slideInUp 0.8s ease-out 0.4s both;
}

/* Custom Input */
/* .custom-input {
  margin-bottom: 20px;
}

.custom-input :deep(.q-field__control) {
  border-radius: 15px;
  background: #F9FAFB;
  border: 2px solid #F0F3F4;
} */

/* .custom-input :deep(.q-field__control:hover) {
  border-color: #FF5300;
  background: #FFFFFF;
} */

/* .custom-input :deep(.q-field__label) {
  color: #1C2B36;
  font-weight: 500;
} */

/* .custom-input :deep(.q-field__prepend) .q-icon,
.custom-input :deep(.q-field__append) .q-icon {
  color: #FF5300;
} */

/* Login Button */
.login-btn {
  background: linear-gradient(135deg, #FF5300 0%, #E04800 100%);
  color: white;
  /* border-radius: 15px; */
  /* padding: 15px; */
  /* font-weight: 600; */
  /* text-transform: none; */
  /* box-shadow: 0 8px 25px rgba(255, 83, 0, 0.3); */
  /* transition: all 0.3s ease; */
  /* position: relative; */
  /* overflow: hidden; */
}

/* .login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
} */

/* .login-btn:hover::before {
  left: 100%;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(255, 83, 0, 0.4);
}

.login-btn:active {
  transform: translateY(0);
} */

/* Response Card */
.response-card {
  margin-top: 20px;
  background: #F0F3F4;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  animation: slideInUp 0.6s ease-out;
}

.text-positive {
  color: #4CAF50;
}

.text-negative {
  color: #F44336;
}

/* Animations */
/* @keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
} */

/* @keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
} */

/* @keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
} */

/* @keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
} */

/* Responsive Design */
@media (max-width: 768px) {
  .login-container {
    padding: 15px;
  }

  .login-content {
    max-width: 100%;
  }

  .brand-title {
    font-size: 2rem;
  }

  .shape {
    display: none;
  }
}

@media (max-width: 480px) {
  .login-card {
    margin: 0 10px;
  }

  .brand-title {
    font-size: 1.8rem;
  }

  .brand-subtitle {
    font-size: 0.9rem;
  }
}
</style>
