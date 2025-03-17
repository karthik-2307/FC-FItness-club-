<template>
  <div class="text-center pa-4">
    <v-dialog v-model="dialog" max-width="400" persistent>
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-bind="activatorProps" dark> Add New Workout </v-btn>
      </template>

      <v-card>
        <v-card-title class="text-h6">Add Workout</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <form @submit.prevent="submit">
            <v-text-field
              v-model="name.value.value"
              :counter="10"
              :error-messages="name.errorMessage.value"
              label="Workout Name"
              outlined
            ></v-text-field>

            <v-select
              v-model="select.value.value"
              :error-messages="select.errorMessage.value"
              :items="items"
              label="Difficulty Level"
              outlined
            ></v-select>

            <v-text-field
              v-model="minutes.value.value"
              type="number"
              :error-messages="minutes.errorMessage.value"
              label="Duration (Minutes)"
              outlined
            ></v-text-field>
          </form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="justify-end">
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn text @click="submit">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { eventBus } from "@/stores/eventbus";
import { ref } from "vue";
import { useField, useForm } from "vee-validate";
import { supabase } from "@/composables/supabase";

const loading = ref(false);
const dialog = ref(false);
const items = ref(["Beginner", "Intermediate", "Advanced"]);

const { handleSubmit, resetForm } = useForm({
  validationSchema: {
    name(value) {
      if (value?.length >= 2) return true;
      return "Name needs to be at least 2 characters.";
    },
    select(value) {
      if (value) return true;
      return "Select an item.";
    },
    minutes(value) {
      if (value && value > 0) return true;
      return "Enter a valid number of minutes.";
    },
  },
});

const name = useField("name");
const select = useField("select");
const minutes = useField("minutes");

const fetchUserEmail = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return user?.email || "";
};

const submit = handleSubmit(async (values) => {
  const email = await fetchUserEmail();

  const now = new Date();
const currentDateTime = now.toISOString().replace("T", " ").slice(0, 19); 


  loading.value = true;

  const { error } = await supabase
    .from("workoutroutines")
    .insert([
      {
        email_address: email,
        workout_name: values.name,
        duration_minutes: values.minutes,
        difficulty_level: values.select,
        date: currentDateTime,
      },
    ]);

  loading.value = false;

  if (!error) {
    resetForm();
    eventBus.emit("WorkOutAdded");
    dialog.value = false;
  } else {
    console.error("Error adding workout:", error);
  }
});

// Close dialog & reset fields
const closeDialog = () => {
  resetForm();
  dialog.value = false;
};
</script>
