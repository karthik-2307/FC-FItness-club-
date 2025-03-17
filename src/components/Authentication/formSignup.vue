<template>
  <v-card
    :disabled="loading"
    :loading="loading"
    class="mx-auto my-12"
    max-width="400"
  >
    <template #loader="{ isActive }">
      <v-progress-linear
        :active="isActive"
        color="deep-purple"
        height="4"
        indeterminate
      />
    </template>

    <v-card-title class="text-center"> Sign Up </v-card-title>

    <v-card-text>
      <v-form @submit.prevent="login">
        <!-- Email Field -->
        <v-text-field
          v-model="email"
          label="Email"
          variant="outlined"
          :rules="[validateEmail]"
          required
        />

        <!-- Password Field -->
        <v-text-field
          v-model="password"
          label="Password"
          variant="outlined"
          type="password"
          required
        />

        <!-- Confirm Password Field -->
        <v-text-field
          v-model="confirmPassword"
          label="Confirm Password"
          variant="outlined"
          type="password"
          required
          :rules="[validatePasswordMatch]"
        />

        <!-- Error Message -->
        <v-alert v-if="errorMessage" type="error" class="mb-4">
          {{ errorMessage }}
        </v-alert>

        <!-- Login Button -->
        <v-btn
          color="deep-purple-lighten-2"
          text="SignUp"
          block
          border
          :disabled="loading"
          @click="login"
        />
      </v-form>
    </v-card-text>
    <v-container class="d-flex flex-column align-center justify-center">
      <v-btn color="blue darken-2" @click="handleGoogleLogin">
        <v-icon left> mdi-google </v-icon>
        Sign in with Google
      </v-btn>
    </v-container>
  </v-card>

  <v-dialog v-model="showDialog" fullscreen>
    <v-card>
      <v-card-title>One Time Password login</v-card-title>
      <v-card-text>
        <p>
          We've sent a one time password login the the following email address:
          <strong>{{ email }}</strong
          >. Using the link in the email, you can proceed to the app and you can
          close this browser window.
        </p>
        <p>If this is not the correct email address, please try again.</p>
      </v-card-text>
    </v-card>
  </v-dialog>
  <routerview />
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/userStore";
const showDialog = ref(false);
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
const handleGoogleLogin = async () => {
  const error = await userStore.loginWithGoogle();
  if (error) alert(error);
};
const login = async () => {
  errorMessage.value = "";
  if (!validateEmail(email.value) || password.value !== confirmPassword.value) {
    errorMessage.value = "Please fix errors before proceeding.";
    return;
  }

  try {
    loading.value = true;
    const msg = await userStore.emailAndPasswordSignUp(
      email.value,
      password.value,
    );
    showDialog.value = true;
  } catch (error) {
    errorMessage.value = error.message || "SignUp failed. Try again.";
    console.log(errorMessage.value);
  } finally {
    loading.value = false;
  }
};
</script>
