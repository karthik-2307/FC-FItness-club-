<template>
  <v-app >
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
  <v-icon>{{ theme.global.current.value.dark  ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
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
    <v-overlay v-model="overlay" class="d-flex justify-center align-center">
      <v-card class="mx-auto" elevation="16" max-width="400">
        <v-card-item>
          <v-card-title>Oops</v-card-title>
          <v-card-subtitle style="width: 300px;">Please update the username</v-card-subtitle>
        </v-card-item>
        <v-card-text>
          <v-text-field 
            clearable 
            label="Username" 
            variant="outlined"  
            :rules="rules" 
            v-model="userName">
          </v-text-field>
          <v-alert v-if="submissionError" type="error" class="mt-2">
            {{ submissionError }}
          </v-alert>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn 
            color="primary" 
            :disabled="!isValidUserName" 
            @click="submitUsername">
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-overlay>
  </v-app>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/userStore";
import WorkoutCheckIn from "@/components/WorkOuts/workoutCheckIn.vue";
import MyWorkouts from "@/components/WorkOuts/myWorkouts.vue";
import Heatmap from "@/components/WorkOuts/Heatmap.vue";
import { useTheme } from 'vuetify'
const theme = useTheme()
// import UserProfile from "@/components/Profile/UserProfile.vue";
import { supabase } from "@/composables/supabase";
  import { ref, computed, onMounted, onUnmounted } from "vue";
  import { fetchUserEmail } from "@/composables/userEmail";
import { useField, useForm } from "vee-validate";
import { eventBus } from "@/stores/eventbus";

const UserStore = useUserStore();
const activeNav = ref(0);
const activeSection = ref("checkin");
const dialog = ref(false);
const items = ref(["Beginner", "Intermediate", "Advanced"]);

const overlay = ref(false);
  const userName = ref<string>("");
  const userNames = ref<string[]>([]);
  const submissionError = ref<string | null>(null);
const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  eventBus.emit('themeChanged');
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

  
  const fetchUsernames = async () => {
    const { data: profiles, error } = await supabase.from("profiles").select("user_name");
    if (error) {
      console.error("Error fetching profiles:", error);
      return;
    }
    userNames.value = profiles?.map(profile => profile.user_name).filter(name => name) || [];
  };
  

  const isUserNameExists=async()=>{
    const { data: profiles, error }= await supabase.from("profiles").select("user_name").eq('email_address',fetchUserEmail);
    if(profiles && profiles[0].user_name==null)
  {
    overlay.value=true;
  }
  else
  overlay.value=false;
  }
  const isValidUserName = computed(() => {
    return userName.value.length >= 3 && !userNames.value.includes(userName.value);
  });
  
  const rules = [
    (value: string) => !!value && value.length >= 3 || "Min 3 characters",
    (value: string) => !userNames.value.includes(value) || "Username already taken"
  ];
  
  const submitUsername = async () => {
    await fetchUsernames();
  
    if (userNames.value.includes(userName.value)) {
      submissionError.value = "Oops! Someone else just took this username. Please choose another.";
      return;
    }
  // console.log(fetchUserEmail);
    const { error } = await supabase.from("profiles").update({user_name: userName.value}).eq('email_address',fetchUserEmail);
  
    if (error) {
      console.error("Error inserting username:", error);
      submissionError.value = "Error submitting username. Please try again.";
    } else {
      // console.log("Username submitted:", userName.value);
      overlay.value = false; 
    }
  };
  
  onMounted(async () => {
    await isUserNameExists();
    await fetchUsernames();
   
  });
</script>

<style scoped>
.fill-height {
  height: 100vh;
}

.main-content {
  margin-top: 10%;
}
</style>
