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
            <th class="text-left">Edit</th>
            <th class="text-left">Delete</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in usersRoutine" :key="item.email_address">
            <td>{{ item.workout_name }}</td>
            <td>{{ item.difficulty_level }}</td>
            <td>{{ item.duration_minutes }} Minutes</td>
            <td>
              <v-btn icon="mdi-pencil" variant="text" color="primary" @click="openEditDialog(item)"></v-btn>
            </td>
            <td>
              <v-btn icon="mdi-delete" variant="text" color="red" @click="deleteWorkout(item.id)"></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

      <v-alert v-else type="info" variant="outlined" class="mt-3">
        No workout routines found.
      </v-alert>
    </v-card>

    <v-dialog v-model="editDialog" max-width="400">
      <v-card>
        <v-card-title>Edit Workout</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-text-field v-model="editItemData.workout_name" label="Workout Name" outlined></v-text-field>
          <v-select v-model="editItemData.difficulty_level" :items="difficultyLevels" label="Difficulty Level" outlined></v-select>
          <v-text-field v-model="editItemData.duration_minutes" type="number" label="Duration (Minutes)" outlined></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="justify-end">
          <v-btn  text @click="editDialog = false">Cancel</v-btn>
          <v-btn  text @click="updateItem">Update</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
    id: number;
  }[]
>([]);
const editDialog = ref(false);
const editItemData = ref();
const difficultyLevels = ["Easy", "Medium", "Hard"];

const fetchUserEmail = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error fetching user:", error);
    return;
  }
  email.value = data.user?.email || null;
};

const openEditDialog = (item: any) => {
  editItemData.value = { ...item };
  editDialog.value = true;
};
const deleteWorkout=async(id:number)=>{
  const { error } = await supabase
  .from('workoutroutines')
  .delete()
  .eq('id', id)
  eventBus.emit('workOutDataUpdated')
}
const updateItem = async () => {
  const { data, error } = await supabase
    .from("workoutroutines")
    .update({
      workout_name: editItemData.value.workout_name,
      duration_minutes: editItemData.value.duration_minutes,
      difficulty_level: editItemData.value.difficulty_level
    })
    .eq("id", editItemData.value.id)
    .select();

  if (error) {
    console.log(error);
    throw error;
  }

  editDialog.value = false;
 eventBus.emit('workOutDataUpdated');
};
eventBus.on('workOutDataUpdated',()=>{
  getUserWorkouts();
})
const getUserWorkouts = async () => {
  if (!email.value) return;

  const { data: workoutroutines, error } = await supabase
    .from("workoutroutines")
    .select("*")
    .eq("email_address", email.value)
    .order('id', { ascending: false })

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
