<template>
  <v-container class="d-flex flex-column align-center justify-center">
    <v-btn color="blue darken-2" @click="handleGoogleLogin">
      <v-icon left> mdi-google </v-icon>
      Sign in with Google
    </v-btn>
  </v-container>
</template>

<script setup>
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();

const handleGoogleLogin = async () => {
  const error = await userStore.loginWithGoogle();
  if (error) alert(error);
};
</script>
