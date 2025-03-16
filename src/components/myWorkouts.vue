<template>
  <v-container>
    <v-card class="pa-4" elevation="2">
      <v-card-title class="text-h5">Your Workout Routines</v-card-title>
      <v-divider class="my-2"></v-divider>

      <v-table v-if="usersRoutine.length">
        <thead>
          <tr>
            <th class="text-left">Workout</th>
            <th class="text-left">Difficulty</th>
            <th class="text-left">Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in usersRoutine" :key="item.email_address">
            <td>{{ item.workout_name }}</td>
            <td>{{ item.difficulty_level }}</td>
            <td>{{ item.duration_minutes }} Minutes</td>
          </tr>
        </tbody>
      </v-table>

      <v-alert v-else type="info" variant="outlined" class="mt-3">
        No workout routines found.
      </v-alert>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { eventBus } from "@/stores/eventbus";
import { ref, onMounted, watch } from "vue";
import { supabase } from "@/composables/supabase";

const email = ref<string | null>(null);
const usersRoutine = ref<
  {
    difficulty_level: string;
    duration_minutes: string;
    email_address: string;
    workout_name: string;
  }[]
>([]);

const fetchUserEmail = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error fetching user:", error);
    return;
  }
  email.value = data.user?.email || null;
};

const getUserWorkouts = async () => {
  if (!email.value) return;

  const { data: workoutroutines, error } = await supabase
    .from("workoutroutines")
    .select("*")
    .eq("email_address", email.value);

  if (error) {
    console.error("Error fetching workouts:", error);
    return;
  }

  usersRoutine.value = workoutroutines || [];
};

watch(email, (newEmail) => {
  if (newEmail) getUserWorkouts();
});
eventBus.on("WorkOutAdded", () => {
  getUserWorkouts();
});
onMounted(fetchUserEmail);
</script>
