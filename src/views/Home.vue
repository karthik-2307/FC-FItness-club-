<script setup lang="ts">
import { useUserStore } from "@/stores/userStore";
import addWorkout from "@/components/WorkOuts/addWorkout.vue";
import myWorkouts from "@/components/WorkOuts/myWorkouts.vue";
import router from "@/router";
const UserStore = useUserStore();
const logout = () => {
  UserStore.logout();
};
const navToCheckIn=()=>{
  router.push({name:'checkIn'});
}
</script>

<template>
  Home
  <v-btn @click="logout()"> Logout </v-btn>
  <v-btn @click="navToCheckIn()">CheckIn's</v-btn>
  <add-workout />
  <myWorkouts />
</template>
