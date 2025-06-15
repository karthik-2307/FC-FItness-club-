<template>
  <v-container class="habit-tracker">
    <v-card class="pa-4">
      <v-card-title class="text-h5">🏋️‍♂️ Workout Tracker</v-card-title>
      <v-divider></v-divider>
      <v-card-text
        >Check in your workouts daily and track progress!
        <br />
        Double click to make an entry !</v-card-text
      >

      <v-table fixed-header>
        <thead>
          <tr>
            <th class="text-left">Workout</th>
            <th class="text-left">Current Streak</th>
            <th class="text-left">Longest Streak</th>
            <th v-for="date in weekDates" :key="date">
              {{ formatDate(date) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="workout in workouts" :key="workout.name">
            <td class="text-left">{{ workout.name }}</td>
            <td class="text-left">{{ workout.streak }}</td>
            <td class="text-left">{{ longest_streak[workout.name] }}</td>
            <td v-for="date in weekDates" :key="date">
              <v-checkbox
                :disabled="today_date != date"
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
import { eventBus } from "@/stores/eventbus";

// Define workouts & check-in
const today_date = ref(new Date().toISOString().split("T")[0]);
const longest_streak = ref<Record<string, number>>({});
const workouts = ref<{ name: string; streak: number }[]>([]);
const checkinData = ref<Record<string, string[]>>({});

// Update today's date only when needed
const updateTodayDate = () => {
  today_date.value = new Date().toISOString().split("T")[0];
};

// Get current week dates
const weekDates = computed(() => {
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
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
    .select("workout_name, checkin_dates, current_streak, longest_streak")
    .eq("email_address", email)
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching workouts:", error);
    return;
  }

  workouts.value = workout_checkins?.map((workout) => ({
    name: workout.workout_name,
    streak: workout.current_streak,
  })) || [];

  workout_checkins?.forEach((workout) => {
    checkinData.value[workout.workout_name] = workout.checkin_dates || [];
    longest_streak.value[workout.workout_name] = workout.longest_streak;
  });
};

const calculateStreak = (dates: string[]): { current: number; longest: number } => {
  if (!dates.length) return { current: 0, longest: 0 };

  const sortedDates = [...dates].sort();
  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    
    // Check if dates are consecutive
    const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
      currentStreak = Math.max(currentStreak, tempStreak);
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  return { current: currentStreak, longest: longestStreak };
};

const toggleCheckin = async (workout: string, date: string) => {
  if (!checkinData.value[workout]) {
    checkinData.value[workout] = [];
  }

  // Toggle the date in the checkin array
  if (checkinData.value[workout].includes(date)) {
    checkinData.value[workout] = checkinData.value[workout].filter(d => d !== date);
  } else {
    checkinData.value[workout].push(date);
  }

  // Calculate streaks
  const { current, longest } = calculateStreak(checkinData.value[workout]);
  longest_streak.value[workout] = longest;

  const email = await fetchUserEmail();
  if (!email) return;

  // Update the database
  const { error } = await supabase
    .from("workout_checkins")
    .update({
      checkin_dates: checkinData.value[workout],
      current_streak: current,
      longest_streak: longest,
    })
    .eq("email_address", email)
    .eq("workout_name", workout);

  if (error) {
    console.error("Error updating checkin:", error);
    return;
  }

  eventBus.emit("checkedin");
  updateWorkoutCheckins();
};

// Event listeners
eventBus.on("WorkOutAdded", () => {
  updateWorkoutCheckins();
});

eventBus.on("checkedin", () => {
  updateWorkoutCheckins();
});

// Initialize
onMounted(() => {
  updateWorkoutCheckins();
  // Update today's date at midnight
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const timeToMidnight = tomorrow.getTime() - now.getTime();
  setTimeout(() => {
    updateTodayDate();
    setInterval(updateTodayDate, 24 * 60 * 60 * 1000);
  }, timeToMidnight);
});
</script>

<style>
.habit-tracker {
  max-width: 800px;
  margin: auto;
  text-align: center;
}
</style>
