<script setup lang="ts">
import { onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";
import { supabase } from "@/composables/supabase";
const userStore = useUserStore();
onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  if (data && data.session && data.session.user) {
    await userStore.insertProfile(data.session);
    userStore.setUserSession(data.session);
  }
  supabase.auth.onAuthStateChange((_, _session) => {
    userStore.setUserSession(_session);
  });
});
</script>
<template>
  <router-view />
</template>
