<script setup>
import { onMounted } from "vue";
import { supabase } from "@/composables/supabase";
import { useUserStore } from "@/stores/userStore";
import router from "@/router";

const userStore = useUserStore();

onMounted(async () => {
  const { data, error } = await supabase.auth.getSessionFromUrl();

  if (error) {
    console.error("OAuth callback error:", error.message);
    router.push("/login");
    return;
  }

  if (data.session) {
    userStore.setUserSession(data.session);
    await userStore.insertProfile(data.session);
    router.push("/"); // or "/newuser" if it's first time
  }
});
</script>

<template>
  <div>Finishing login...</div>
</template>
