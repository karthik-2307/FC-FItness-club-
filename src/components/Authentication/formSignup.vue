<template>
  <div>
    <v-img
      class="mx-auto my-6"
      max-width="200"
      src="https://www.freepnglogos.com/uploads/dumbbell/dumbbell-clipart-etsy-3.png"   ></v-img>


    <v-card class="mx-auto pa-12 pb-8" elevation="8" max-width="448" rounded="lg">
      <div class="text-subtitle-1 text-medium-emphasis">Create an Account</div>

      <v-text-field
        v-model="email"
        density="compact"
        placeholder="Email address"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
        :rules="[validateEmail]"
        required
      ></v-text-field>

      <v-text-field
        v-model="password"
        :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visible ? 'text' : 'password'"
        density="compact"
        placeholder="Enter your password"
        prepend-inner-icon="mdi-lock-outline"
        variant="outlined"
        @click:append-inner="visible = !visible"
        required
      ></v-text-field>

      <v-text-field
        v-model="confirmPassword"
        :append-inner-icon="visibleConfirm ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visibleConfirm ? 'text' : 'password'"
        density="compact"
        placeholder="Confirm your password"
        prepend-inner-icon="mdi-lock-outline"
        variant="outlined"
        @click:append-inner="visibleConfirm = !visibleConfirm"
        :rules="[validatePasswordMatch]"
        required
      ></v-text-field>

      <v-alert v-if="errorMessage" type="error" class="mb-4">
        {{ errorMessage }}
      </v-alert>

      <v-btn class="mb-8" color="blue" size="large" variant="tonal" block @click="signUp">
        Sign Up
      </v-btn>

      <v-btn color="blue darken-2" block @click="handleGoogleLogin">
        <v-icon left>mdi-google</v-icon>
        Sign up with Google
      </v-btn>

      <v-card-text class="text-center mt-4">
        <router-link to="/login" class="text-blue text-decoration-none">
          Already have an account? Log in <v-icon icon="mdi-chevron-right"></v-icon>
        </router-link>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const visible = ref(false);
const visibleConfirm = ref(false);
const errorMessage = ref('');
const userStore = useUserStore();

const validateEmail = (value) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value) || 'Enter a valid email';
};

const validatePasswordMatch = () => {
  return password.value === confirmPassword.value || 'Passwords do not match';
};

const handleGoogleLogin = async () => {
  const error = await userStore.loginWithGoogle();
  if (error) alert(error);
};

const signUp = async () => {
  errorMessage.value = '';
  if (!validateEmail(email.value) || password.value !== confirmPassword.value) {
    errorMessage.value = 'Please fix errors before proceeding.';
    return;
  }
  try {
    const msg = await userStore.emailAndPasswordSignUp(email.value, password.value);
    // console.log(msg);
  } catch (error) {
    errorMessage.value = error.message || 'Sign-up failed. Try again.';
  }
};
</script>
