<template>
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
  </template>
  
  <script lang="ts" setup>
  import { supabase } from "@/composables/supabase";
  import { ref, computed, onMounted, onUnmounted } from "vue";
  import { fetchUserEmail } from "@/composables/userEmail";
  const overlay = ref(true);
  const userName = ref<string>("");
  const userNames = ref<string[]>([]);
  const submissionError = ref<string | null>(null);
  
  const fetchUsernames = async () => {
    const { data: profiles, error } = await supabase.from("profiles").select("user_name");
    if (error) {
      console.error("Error fetching profiles:", error);
      return;
    }
    userNames.value = profiles?.map(profile => profile.user_name).filter(name => name) || [];
  };
  

  
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
  
    const { error } = await supabase.from("profiles").update({user_name: userName.value}).eq('email_address',fetchUserEmail);
  
    if (error) {
      console.error("Error inserting username:", error);
      submissionError.value = "Error submitting username. Please try again.";
    } else {
      console.log("Username submitted:", userName.value);
      overlay.value = false; 
    }
  };
  
  onMounted(async () => {
    await fetchUsernames();
  });
  

  </script>
  