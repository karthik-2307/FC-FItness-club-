<script setup lang="ts">
import { useUserStore } from "@/stores/userStore";
import addWorkout from "@/components/WorkOuts/addWorkout.vue";
import myWorkouts from "@/components/WorkOuts/myWorkouts.vue";
const UserStore = useUserStore();
const logout = () => {
  console.log("hel");
  UserStore.logout();
};
</script>

<template>
  Home
  <v-btn @click="logout()"> Logout </v-btn>
  <add-workout />
  <myWorkouts />
</template>
