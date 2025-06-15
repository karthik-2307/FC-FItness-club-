<script setup>
import { onMounted } from "vue";
import { supabase } from "@/composables/supabase";
import { useUserStore } from "@/stores/userStore";
import router from "@/router";

const userStore = useUserStore();

onMounted(async () => {
  try {
    const { data, error } = await supabase.auth.getSessionFromUrl();

    if (error) {
      console.error("OAuth callback error:", error.message);
      router.push("/login");
      return;
    }

    if (data.session) {
      console.log("Session received:", data.session);
      userStore.setUserSession(data.session);
      const profileResult = await userStore.insertProfile(data.session);
      
      if (profileResult) {
        router.push("/");
      } else {
        console.error("Failed to insert profile");
        router.push("/login");
      }
    } else {
      console.error("No session data received");
      router.push("/login");
    }
  } catch (err) {
    console.error("Unexpected error during OAuth callback:", err);
    router.push("/login");
  }
});
</script>

<template>
  <div class="d-flex justify-center align-center" style="height: 100vh;">
    <v-progress-circular
      indeterminate
      color="primary"
      size="64"
    ></v-progress-circular>
    <span class="ml-4">Finishing login...</span>
  </div>
</template>
