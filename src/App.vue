<template>
  <router-view />
</template>

<script setup>
import { useAuthStore } from 'stores/auth'

defineOptions({
  name: 'App'
});

const authStore = useAuthStore()
authStore.initializeAuth()
</script>
