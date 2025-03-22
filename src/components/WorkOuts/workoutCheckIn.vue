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
const days_months = new Map<string, number>();
const workouts = ref<{ name: string; streak: number }[]>([]);
const checkinData = ref<Record<string, string[]>>({});
setInterval(() => {
  today_date.value = new Date().toISOString().split("T")[0];
  new Date().toISOString().split("T")[0];
}, 1000);
//updating months with the number of days
days_months.set("01", 31);
days_months.set("02", 28);
days_months.set("03", 31);
days_months.set("04", 30);
days_months.set("05", 31);
days_months.set("06", 30);
days_months.set("07", 31);
days_months.set("08", 31);
days_months.set("09", 30);
days_months.set("10", 31);
days_months.set("11", 30);
days_months.set("12", 31);
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
    .select("workout_name, checkin_dates,current_streak,longest_streak")
    .eq("email_address", email)
    .order("id", { ascending: false });
  if (error) {
    console.error("Error fetching workouts:", error);
    return;
  }
  workouts.value =
    workout_checkins?.map((workout) => ({
      name: workout.workout_name,
      streak: workout.current_streak,
    })) || [];

  workout_checkins?.forEach((workout) => {
    checkinData.value[workout.workout_name] = workout.checkin_dates || [];
    longest_streak.value[workout.workout_name] = workout.longest_streak;
  });
};

const toggleCheckin = async (workout: string, date: string) => {
  if (!checkinData.value[workout]) {
    checkinData.value[workout] = [];
  }

  if (checkinData.value[workout].includes(date)) {
    checkinData.value = {
      ...checkinData.value,
      [workout]: checkinData.value[workout].filter((d) => d !== date),
    };
  } else {
    checkinData.value[workout].push(date);
  }
  let current_streak = 0;
  let current_day: number = -1;
  checkinData.value[workout].sort();
  checkinData.value[workout].reverse();

  checkinData.value[workout].forEach((element) => {
    let day = parseInt(element[8] + element[9]);
    if (current_day == -1) {
      current_day = day;
      current_streak++;
    } else {
      if (day == current_day - 1) {
        current_streak++;
        current_day = day;
      } else if (current_day == 1) {
        let month = element[5] + element[6];
        let year = parseInt(element[0] + element[1] + element[2] + element[3]);
        if (month == "02" && year % 4 != 0 && day == 28) {
          current_streak++;
          current_day = day;
        } else if (
          month == "02" &&
          ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) &&
          day == 29
        ) {
          current_streak++;
          current_day = day;
        } else if (
          (month == "01" ||
            month == "03" ||
            month == "05" ||
            month == "07" ||
            month == "08" ||
            month == "10" ||
            month == "12") &&
          day == 31
        ) {
          current_streak++;
          current_day = day;
        } else if (
          (month == "04" || month == "06" || month == "09" || month == "11") &&
          day == 30
        ) {
          current_streak++;
          current_day = day;
        }
      } else {
        return;
      }
    }
  });
  let long = 0,streak=0;
  current_day=-1
  checkinData.value[workout].forEach((element) => {
    let day = parseInt(element[8] + element[9]);
    if (current_day == -1) {
      current_day = day;
      long++;
    } else {
      if (day == current_day - 1) {
        long++;
        current_day = day;
      } else if (current_day == 1) {
        let month = element[5] + element[6];
        let year = parseInt(element[0] + element[1] + element[2] + element[3]);
        if (month == "02" && year % 4 != 0 && day == 28) {
          long++;
          current_day = day;
        } else if (
          month == "02" &&
          ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) &&
          day == 29
        ) {
          long++;
          current_day = day;
        } else if (
          (month == "01" ||
            month == "03" ||
            month == "05" ||
            month == "07" ||
            month == "08" ||
            month == "10" ||
            month == "12") &&
          day == 31
        ) {
          long++;
          current_day = day;
        } else if (
          (month == "04" || month == "06" || month == "09" || month == "11") &&
          day == 30
        ) {
          long++;
          current_day = day;
        }
      } else {
        streak=Math.max(long,streak);
       
        long = 1;
      }
    }
  });
  longest_streak.value[workout] = Math.max(long, streak);
  console.log(longest_streak.value[workout]);
  const email = await fetchUserEmail();

  await supabase
    .from("workout_checkins")
    .update({
      checkin_dates: checkinData.value[workout],
      current_streak: current_streak,
      longest_streak: longest_streak.value[workout],
    })
    .eq("email_address", email)
    .eq("workout_name", workout);
  eventBus.emit("checkedin");
  updateWorkoutCheckins();
};
eventBus.on("WorkOutAdded", () => {
  updateWorkoutCheckins();
});
eventBus.on("checkedin", () => {
  updateWorkoutCheckins();
});
onMounted(updateWorkoutCheckins);
</script>

<style>
.habit-tracker {
  max-width: 800px;
  margin: auto;
  text-align: center;
}
</style>
