<!-- <template>
    <div class="calendar-container">
      <vue-cal
        class="custom-calendar"
        :events="events"
        :hide-view-selector="true"
        default-view="month"
        @click-day="toggleCheckin"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import VueCal from "vue-cal";
  import "vue-cal/dist/vuecal.css";
  
  // Mocked check-in dates from the database
  const checkinDates = ref(["2024-03-01", "2024-03-05", "2024-03-10"]);
  
  // Generate events for checked-in dates
  const events = ref([]);
  
  onMounted(() => {
    updateEvents();
  });
  
  // Function to toggle check-in for a date
  const toggleCheckin = (date) => {
    const formattedDate = date.date; // Vue Cal gives date in YYYY-MM-DD format
  
    if (checkinDates.value.includes(formattedDate)) {
      // Remove from check-in dates
      checkinDates.value = checkinDates.value.filter((d) => d !== formattedDate);
    } else {
      // Add to check-in dates
      checkinDates.value.push(formattedDate);
    }
  
    updateEvents();
  };
  
  // Update calendar events to reflect check-ins
  const updateEvents = () => {
    events.value = checkinDates.value.map((date) => ({
      start: date,
      title: "✔ Checked in",
      class: "checked-in",
    }));
  };
  </script>
  
  <style>
  /* Custom styles */
  .custom-calendar {
    height: 500px;
    width: 100%;
  }
  .checked-in {
    background-color: #4caf50 !important;
    color: white;
  }
  </style>
   -->
<template>
  <div class="habit-tracker">
    <h2>Workout Tracker</h2>
    <table>
      <thead>
        <tr>
          <th>Workout</th>
          <th v-for="day in days" :key="day">{{ day }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="workout in workouts" :key="workout.name">
          <td>{{ workout.name }}</td>
          <td v-for="day in days" :key="day">
            <input
              type="checkbox"
              :checked="isChecked(workout.name, day)"
              @change="toggleCheckin(workout.name, day)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Sample data (Replace with Supabase data)
const workouts = ref([
  { name: "Push-ups" },
  { name: "Running" },
  { name: "Squats" },
  { name: "Yoga" },
]);

const days = ["SUN", "MON", "TUES", "WED", "THU", "FRI", "SAT"]; // Weekdays

// Mock check-in data (Replace with fetched data from Supabase)
const checkinDates = ref({
  "Push-ups": ["M", "W", "F"],
  Running: ["T", "S"],
});

// Check if workout is checked on a given day
const isChecked = (workout, day) => {
  return checkinDates.value[workout]?.includes(day);
};

// Toggle check-in status
const toggleCheckin = (workout, day) => {
  if (!checkinDates.value[workout]) {
    checkinDates.value[workout] = [];
  }
  if (checkinDates.value[workout].includes(day)) {
    checkinDates.value[workout] = checkinDates.value[workout].filter(
      (d) => d !== day,
    );
  } else {
    checkinDates.value[workout].push(day);
  }
};
</script>

<style>
.habit-tracker {
  max-width: 600px;
  margin: auto;
  text-align: center;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 10px;
  border: 1px solid #ddd;
}
input[type="checkbox"] {
  width: 18px;
  height: 18px;
}
</style>
