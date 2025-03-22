<template>
  <div>
    <v-img
      class="mx-auto my-6"
      max-width="200"
      src="https://www.freepnglogos.com/uploads/dumbbell/dumbbell-clipart-etsy-3.png"   ></v-img>

    <v-card class="mx-auto pa-12 pb-8" elevation="8" max-width="448" rounded="lg">
     
      <div class="text-subtitle-1 text-medium-emphasis">Account</div>
      
      <v-text-field
        v-model="email"
        density="compact"
        placeholder="Email address"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
        :rules="[validateEmail]"
        required
      ></v-text-field>

      <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
        Password
        <a class="text-caption text-decoration-none text-blue" href="#">Forgot login password?</a>
      </div>

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

     

      <v-alert v-if="errorMessage" type="error" class="mb-4">{{ errorMessage }}</v-alert>
      
      <v-btn class="mb-8" color="blue" size="large" variant="tonal" block :disabled="loading" @click="login">
        Log In
      </v-btn>

      <v-card-text class="text-center">
        <router-link class="text-blue text-decoration-none" to="/SignUpEmailNPass">
          Sign up now <v-icon icon="mdi-chevron-right"></v-icon>
        </router-link>
      </v-card-text>

      <v-btn color="blue darken-2" block @click="handleGoogleLogin">
        <v-icon left>mdi-google</v-icon>
        Sign in with Google
      </v-btn>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/userStore";
import router from "@/router";

const email = ref("");
const password = ref("");
const visible = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const userStore = useUserStore();

const validateEmail = (value) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value) || "Enter a valid email";
};

const login = async () => {
  errorMessage.value = "";
  if (!validateEmail(email.value)) {
    errorMessage.value = "Please fix errors before proceeding.";
    return;
  }

  try {
    loading.value = true;
    const msg = await userStore.emailAndPasswordLogin(email.value, password.value);
    if (!msg) {
      errorMessage.value = "Invalid username or password";
    } else {
      router.push("/");
    }
  } catch (error) {
    errorMessage.value = error.message || "Login failed. Try again.";
  } finally {
    loading.value = false;
  }
};

const handleGoogleLogin = async () => {
  const error = await userStore.loginWithGoogle();
  if (error) alert(error);
};
</script>
