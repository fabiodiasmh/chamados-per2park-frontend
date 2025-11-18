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
