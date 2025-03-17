<template>
  <v-card
    :disabled="loading"
    :loading="loading"
    class="mx-auto my-12"
    max-width="400"
  >
    <template v-slot:loader="{ isActive }">
      <v-progress-linear
        :active="isActive"
        color="deep-purple"
        height="4"
        indeterminate
      ></v-progress-linear>
    </template>

    <v-card-title class="text-center">Login</v-card-title>

    <v-card-text>
      <v-form @submit.prevent="login">
        <!-- Email Field -->
        <v-text-field
          v-model="email"
          label="Email"
          variant="outlined"
          :rules="[validateEmail]"
          required
        ></v-text-field>

        <!-- Password Field -->
        <v-text-field
          v-model="password"
          label="Password"
          variant="outlined"
          type="password"
          required
        ></v-text-field>

        <!-- Error Message -->
        <v-alert v-if="errorMessage" type="error" class="mb-4">
          {{ errorMessage }}
        </v-alert>

        <!-- Login Button -->
        <v-btn
          color="deep-purple-lighten-2"
          text="Login"
          block
          border
          :disabled="loading"
          @click="login"
        ></v-btn>
      </v-form>
      <router-link to="/SignUpEmailNPass">Sign Up?</router-link>
    </v-card-text>
    <v-container class="d-flex flex-column align-center justify-center">
      <v-btn color="blue darken-2" @click="handleGoogleLogin">
        <v-icon left>mdi-google</v-icon>
        Sign in with Google
      </v-btn>
    </v-container>
    <template> </template>
  </v-card>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/userStore";
import router from "@/router";

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const errorMessage = ref("");
const userStore = useUserStore();

const validateEmail = (value) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value) || "Enter a valid email";
};
const validatePasswordMatch = () => {
  return password.value === confirmPassword.value || "Passwords do not match";
};

const login = async () => {
  errorMessage.value = "";
  if (!validateEmail(email.value)) {
    errorMessage.value = "Please fix errors before proceeding.";
    return;
  }

  try {
    loading.value = true;
    const msg = await userStore.emailAndPasswordLogin(
      email.value,
      password.value,
    );
    console.log(msg);
    if (!msg) {
      errorMessage.value = "Invalid username or password";
    } else {
      router.push("/");
    }
  } catch (error) {
    errorMessage.value = error.message || "Login failed. Try again.";
    console.log(errorMessage.value);
  } finally {
    loading.value = false;
  }
};
const handleGoogleLogin = async () => {
  const error = await userStore.loginWithGoogle();
  if (error) alert(error);
};
</script>
