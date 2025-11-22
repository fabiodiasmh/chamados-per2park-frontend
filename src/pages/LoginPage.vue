<!-- <template>
  <q-page class="login-page flex flex-center">
    <div class="background-animation">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <div class="login-container z-top">
      <q-card class="login-card glass q-pa-lg">
        <q-card-section class="text-center">
          <div class="logo-container q-mb-md">
            <q-avatar size="80px" class="shadow-10">
              <img src="wpsicone.png" alt="Logo" />
            </q-avatar>
          </div>
          <div class="text-h5 text-white text-weight-bold q-mb-xs">Bem-vindo</div>
          <div class="text-caption text-grey-4">Faça login para continuar</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <q-input
              v-model="formData.Login"
              label="Email"
              type="email"
              dense
              outlined
              dark
              color="primary"
              class="input-field"
              :rules="[
                (val) => !!val || 'E-mail é obrigatório',
                (val) => /.+@.+\..+/.test(val) || 'E-mail inválido',
              ]"
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
              outlined
              dark
              color="primary"
              class="input-field"
              :rules="[(val) => !!val || 'Senha é obrigatória']"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  color="grey-5"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <div class="q-mt-lg">
              <q-btn
                type="submit"
                class="full-width bg-gradient-primary text-white shadow-3"
                label="Acessar"
                rounded
                size="lg"
                :loading="authStore.loading"
                :disable="authStore.loading"
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-section class="text-center q-pt-none">
            <div class="text-caption text-grey-6">Versão 1.0.0</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "stores/auth";
import { useQuasar } from "quasar";

defineOptions({
  name: "LoginPage",
});

const router = useRouter();
const authStore = useAuthStore();
const $q = useQuasar();

const formData = ref({
  Login: "",
  Password: "",
});

const ip_servidor = computed({
  get: () => authStore.ip_servidor_store,
  set: (value) => {
    authStore.ip_servidor_store = value;
    localStorage.setItem("ip_servidor", value);
  },
});

const showPassword = ref(false);

const onSubmit = async () => {
  localStorage.setItem("ip_servidor", ip_servidor.value);

  const result = await authStore.login(formData.value);

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Login realizado com sucesso!',
      caption: 'Redirecionando...',
      position: 'top-right',
      progress: true,
      timeout: 1500,
      icon: 'check_circle',
    });

    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);

    const logs={
      usuario_id: authStore.usuario.User.Id,
      nome: authStore.usuario.User.Name,
      email: authStore.usuario.User.Login,
    }

    try {
      await authStore.log_user_login(logs)
    } catch (error) {
      console.error(error);
    }

  } else {
    $q.notify({
      type: 'negative',
      message: result.message || 'Falha no login',
      position: 'top'
    })
  }
};

onMounted(() => {
    // Init logic if needed
});
</script>

<style scoped>
.login-page {
  background: #121212;
  overflow: hidden;
  position: relative;
}

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.blob {
  position: absolute;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 10s infinite ease-in-out;
}

.blob-1 {
  top: -10%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: #1976D2;
  animation-delay: 0s;
}

.blob-2 {
  bottom: -10%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: #9C27B0;
  animation-delay: 2s;
}

.blob-3 {
  top: 40%;
  left: 40%;
  width: 300px;
  height: 300px;
  background: #26A69A;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, 50px); }
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.login-card {
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.input-field :deep(.q-field__control) {
    border-radius: 12px;
}
</style> -->

<template>
  <q-page class="login-page">
    <div class="login-container">
      <!-- Background Animation -->
      <div class="background-animation">
        <div class="floating-shapes">

          <div class="shape shape-5"></div>
        </div>
      </div>

      <!-- Login Content -->
      <div class="login-content">
        <!-- Logo/Brand -->
        <div class="brand-section">
          <div class="logo-container"></div>
          <!-- <div class="text-h3 q-mb-sm brand-title">Per2Park</div> -->
          <!-- <div class="text-subtitle1 brand-subtitle">Sistema de Chamados - Suporte a Estacionamentos</div> -->
        </div>

        <!-- Login Form -->
        <q-card class="login-card">
          <q-img src="wps-perto.jpg"></q-img>
          <q-card-section class="q-ma-md" style="width: auto">
            <!-- <div class="text-h4 text-center q-mb-lg text-primary">Acessar Sistema</div> -->

            <q-form @submit="onSubmit" class="q-gutter-md">
              <q-input
                v-model="formData.Login"
                label="Login Perto"
                type="email"
                dense
                class="custom-input"
                :rules="[
                  (val) => !!val || 'E-mail é obrigatório',
                  (val) => /.+@.+\..+/.test(val) || 'E-mail inválido',
                ]"
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
                :rules="[(val) => !!val || 'Senha é obrigatória']"
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

      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "stores/auth";
import { useQuasar } from "quasar";



defineOptions({
  name: "LoginPage",
});

const router = useRouter();
const authStore = useAuthStore();
const $q = useQuasar();

const formData = ref({
  Login: "",
  Password: "",
});

// const ip_servidor=ref()

// ✅ CORRETO
const ip_servidor = computed({
  get: () => authStore.ip_servidor_store,
  set: (value) => {
    authStore.ip_servidor_store = value;
    localStorage.setItem("ip_servidor", value); // persiste
  },
});

const showPassword = ref(false);
const response = ref(null);

const onSubmit = async () => {
  response.value = null;

  localStorage.setItem("ip_servidor", ip_servidor.value);

  const result = await authStore.login(formData.value);

  response.value = {
    success: result.success,
    message: result.success ? "Login realizado com sucesso!" : result.message,
    data: result.data,
  };

  if (result.success) {
    // $q.notify({
    //   type: 'positive',
    //   message: 'Login realizado com sucesso!',
    //   position: 'top'
    // })
    $q.notify({
  type: 'positive',
  message: 'Login realizado com sucesso!',
  caption: 'Redirecionando para o painel...',
  position: 'top-right',
  progress: true,
  timeout: 2000,
  icon: 'check_circle',
  classes: 'text-white bg-green-8'
});


    // Redirect to dashboard after successful login
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);

    const logs={
      usuario_id: authStore.usuario.User.Id,
      nome: authStore.usuario.User.Name,
      email: authStore.usuario.User.Login,
      // token_acesso: authStore.token
    }
    console.log(logs);

    try {
      await authStore.log_user_login(logs)
    } catch (error) {

    }




  } else {
    $q.notify({
      type: 'negative',

      message: result.message,
      //  caption: '*Confira login senha <br>*Está na rede GRUPO DIGICON <br>*PC da sala ligado <br> *Backend rodando no PC da sala',
  // html: true, // ← necessário para interpretar HTML
      position: 'top'
    })
  }
};

onMounted(() => {
  // authStore. = localStorage.getItem('ip_servidor')
});
</script>

<style scoped>
/* Login Page */
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1c2b36 0%, #2c3e50 100%);
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



/* Login Content */
.login-content {
  width: 350px;
  /* height: 300px; */
  /* z-index: 3; */
}



/* Login Card */
.login-card {
  background: #ffffff;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(28, 43, 54, 0.2);
  border: 3px solid rgba(240, 243, 244, 0.5);
}



/* Login Button */
.login-btn {
  background: linear-gradient(135deg, #ff5300 0%, #e04800 100%);
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


/* Response Card */
.response-card {
}

.text-positive {
  color: #4caf50;
}

.text-negative {
  color: #f44336;
}


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
