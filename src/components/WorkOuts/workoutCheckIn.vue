<template>
  <v-container class="habit-tracker">
    <v-card class="pa-4">
      <v-card-title class="text-h5">🏋️‍♂️ Workout Tracker</v-card-title>
      <v-divider></v-divider>
      <v-card-text>Check in your workouts daily and track progress!</v-card-text>

      <v-table>
        <thead>
          <tr>
            <th>Workout</th>
            <th v-for="date in weekDates" :key="date">{{ formatDate(date) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="workout in workouts" :key="workout.name">
            <td>{{ workout.name }}</td>
            <td v-for="date in weekDates" :key="date">
              <v-checkbox
                v-model="checkinData[workout.name]"
                :value="date"
                @update:modelValue="toggleCheckin(workout.name, date)"
                density="compact"
              ></v-checkbox>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { supabase } from "@/composables/supabase";
import { fetchUserEmail } from "@/composables/userEmail";
import { useLocalStorage } from "@vueuse/core";
import { eventBus } from "@/stores/eventbus";

// Define workouts & check-ins
const workouts = ref<{ name: string }[]>([]);
const checkinData = useLocalStorage<Record<string, string[]>>("workoutCheckins", {});

// Get current week dates
const weekDates = computed(() => {
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0]; // Format YYYY-MM-DD
  });
});

// Format date for display
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", { weekday: "short" });
};

const updateWorkoutCheckins = async () => {
  const email = await fetchUserEmail();
  if (!email) return;

  let { data: workout_checkins, error } = await supabase
    .from("workout_checkins")
    .select("workout_name, checkin_dates")
    .eq("email_address", email)
    .order('id', { ascending: false });
  if (error) {
    console.error("Error fetching workouts:", error);
    return;
  }

  workouts.value = workout_checkins?.map((workout) => ({
    name: workout.workout_name,
  })) || [];

  workout_checkins?.forEach((workout) => {
    checkinData.value[workout.workout_name] = workout.checkin_dates || [];
  });
};

const toggleCheckin = async (workout: string, date: string) => {
  if (!checkinData.value[workout]) {
    checkinData.value[workout] = [];
  }

  if (checkinData.value[workout].includes(date)) {
    checkinData.value[workout] = checkinData.value[workout].filter((d) => d !== date);
  } else {
    checkinData.value[workout].push(date);
  }
  const email = await fetchUserEmail();
  await supabase
    .from("workout_checkins")
    .update({ checkin_dates: checkinData.value[workout] })
    .eq("email_address", email)
    .eq("workout_name", workout);
  eventBus.emit('checkedin');
  updateWorkoutCheckins();
};
eventBus.on('WorkOutAdded',()=>{
  updateWorkoutCheckins();
})
eventBus.on('checkedin',()=>{
  updateWorkoutCheckins();
})
onMounted(updateWorkoutCheckins);
</script>

<style>
.habit-tracker {
  max-width: 800px;
  margin: auto;
  text-align: center;
}
</style>
