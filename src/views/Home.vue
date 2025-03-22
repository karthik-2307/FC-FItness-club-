<template>
  <v-app :theme="theme">
    <!-- Navigation Bar -->
    <v-app-bar app dark>
      <v-toolbar-title class="d-flex align-center">
        <v-img 
          src="../assets/dumbbell-clipart-etsy-3.ico"
          max-height="30" 
          max-width="30" 
          class="mr-2"
        ></v-img>
        Fitness Club
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="toggleTheme">
  <v-icon>{{ theme === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
</v-btn>

      <v-btn @click="logout"><v-icon>mdi-logout</v-icon></v-btn>
    </v-app-bar>

    <!-- Main Content -->
    <v-container fluid class="main-content">
      <workout-check-in v-if="activeSection === 'checkin'" />
      <my-workouts v-if="activeSection === 'workouts'" />
      <heatmap v-if="activeSection === 'analysis'" />
      <user-profile v-if="activeSection === 'profile'" />
    </v-container>

    <!-- Bottom Navigation -->
    <v-bottom-navigation v-model="activeNav" color="primary" grow>
      <v-btn @click="activeSection = 'checkin'">
        <v-icon>mdi-calendar-check</v-icon>
        Check-In
      </v-btn>
      <v-btn @click="activeSection = 'workouts'">
        <v-icon>mdi-dumbbell</v-icon>
        Workouts
      </v-btn>
      
      <!-- Central Plus Button -->
      <v-btn class="add-workout-btn" @click="dialog = true">
        <v-icon size="36">mdi-plus</v-icon>
      </v-btn>
      
      <v-btn @click="activeSection = 'analysis'">
        <v-icon>mdi-chart-line</v-icon>
        Analysis
      </v-btn>
      <v-btn @click="activeSection = 'profile'">
        <v-icon>mdi-account</v-icon>
        Profile
      </v-btn>
    </v-bottom-navigation>

    <!-- Add Workout Dialog -->
    <v-dialog v-model="dialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-h6">Add Workout</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <form @submit.prevent="submit">
            <v-text-field v-model="name.value.value" label="Workout Name" outlined></v-text-field>
            <v-select v-model="select.value.value" :items="items" label="Difficulty Level" outlined></v-select>
            <v-text-field v-model="minutes.value.value" type="number" label="Duration (Minutes)" outlined></v-text-field>
          </form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="justify-end">
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn text @click="submit">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/userStore";
import WorkoutCheckIn from "@/components/WorkOuts/workoutCheckIn.vue";
import MyWorkouts from "@/components/WorkOuts/myWorkouts.vue";
import Heatmap from "@/components/WorkOuts/Heatmap.vue";
// import UserProfile from "@/components/Profile/UserProfile.vue";
import { useField, useForm } from "vee-validate";
import { supabase } from "@/composables/supabase";

const UserStore = useUserStore();
const activeNav = ref(0);
const activeSection = ref("checkin");
const dialog = ref(false);
const items = ref(["Beginner", "Intermediate", "Advanced"]);
const theme = ref("dark");

const toggleTheme = () => {
  theme.value = theme.value === "dark" ? "light" : "dark";
};

const { handleSubmit, resetForm } = useForm();
const name = useField("name");
const select = useField("select");
const minutes = useField("minutes");

const logout = () => {
  UserStore.logout();
};

const submit = handleSubmit(async (values) => {
  const { error } = await supabase.from("workoutroutines").insert([{ ...values }]);
  if (!error) {
    resetForm();
    dialog.value = false;
  }
});

const closeDialog = () => {
  resetForm();
  dialog.value = false;
};
</script>

<style scoped>
.fill-height {
  height: 100vh;
}

.main-content {
  margin-top: 10%;
}
</style>
