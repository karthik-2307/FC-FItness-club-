<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-select
          v-model="selectedYear"
          :items="['current', ...availableYears]"
          label="Select Year"
          @update:modelValue="updateYear"
          outlined
          dense
        ></v-select>
      </v-col>
    </v-row>
    <div v-if="availableWorkouts.length === 0" class="text-center pa-4">
      <v-alert type="info">
        No workouts found. Start adding workouts to see your activity heatmap!
      </v-alert>
    </div>
    <div v-else>
      <div v-for="(workout, index) in availableWorkouts" :key="workout">
        <v-container>
          <h3 class="text-h6 mb-4">{{ workout }}</h3>
          <v-card class="pa-4">
            <div :ref="(el) => setHeatmapRef(el, index)" class="heatmap-container"></div>
          </v-card>
        </v-container>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { onMounted, ref, nextTick, onUnmounted } from "vue";
import * as d3 from "d3";
import { supabase } from "@/composables/supabase";
import { fetchUserEmail } from "@/composables/userEmail";
import { eventBus } from "@/stores/eventbus";

const heatmapContainers = ref([]);
const data = ref({});
const availableYears = ref([2022, 2023, 2024, 2025]);
const selectedYear = ref("current");
const userEmail = ref("");
const availableWorkouts = ref([]);
const loading = ref(false);

// Event listeners
const handleCheckin = async () => {
  await fetchWorkouts();
  await updateYear();
};

eventBus.on("checkedin", handleCheckin);

onMounted(async () => {
  try {
    userEmail.value = await fetchUserEmail();
    await fetchWorkouts();
    await updateYear();
  } catch (error) {
    console.error("Error initializing heatmap:", error);
  }
});

onUnmounted(() => {
  eventBus.off("checkedin", handleCheckin);
});

const setHeatmapRef = (el, index) => {
  if (el) {
    heatmapContainers.value[index] = el;
  }
};

async function fetchWorkouts() {
  if (!userEmail.value) return;

  try {
    const { data: workoutData, error } = await supabase
      .from("workout_checkins")
      .select("workout_name")
      .eq("email_address", userEmail.value);

    if (error) throw error;

    availableWorkouts.value = [
      ...new Set(workoutData.map((entry) => entry.workout_name)),
    ];
  } catch (error) {
    console.error("Error fetching workouts:", error);
  }
}

async function fetchHeatmapData(workout, startDate, endDate) {
  try {
    const { data: checkinData, error } = await supabase
      .from("workout_checkins")
      .select("checkin_dates")
      .eq("email_address", userEmail.value)
      .eq("workout_name", workout);

    if (error) throw error;

    let dataset = [];
    checkinData.forEach((entry) => {
      entry.checkin_dates.forEach((date) => {
        if (new Date(date) >= startDate && new Date(date) <= endDate) {
          dataset.push({ date, value: 1 });
        }
      });
    });

    return dataset;
  } catch (error) {
    console.error("Error fetching heatmap data:", error);
    return [];
  }
}

async function updateYear() {
  if (loading.value) return;
  loading.value = true;

  try {
    const today = new Date();
    let startDate, endDate;

    if (selectedYear.value === "current") {
      startDate = new Date();
      startDate.setFullYear(today.getFullYear() - 1);
      startDate.setDate(today.getDate() + 1);
      endDate = today;
    } else {
      startDate = new Date(`${selectedYear.value}-01-01`);
      endDate = new Date(`${selectedYear.value}-12-31`);
    }

    for (const workout of availableWorkouts.value) {
      data.value[workout] = await fetchHeatmapData(workout, startDate, endDate);
    }

    await nextTick();
    renderHeatmaps(startDate, endDate);
  } catch (error) {
    console.error("Error updating year:", error);
  } finally {
    loading.value = false;
  }
}

function renderHeatmaps(startDate, endDate) {
  availableWorkouts.value.forEach((workout, index) => {
    if (heatmapContainers.value[index]) {
      renderHeatmap(
        heatmapContainers.value[index],
        data.value[workout],
        startDate,
        endDate,
      );
    }
  });
}

function renderHeatmap(container, workoutData, startDate, endDate) {
  const margin = { top: 20, right: 20, bottom: 20, left: 50 };
  const cellSize = 15;
  const width = 53 * (cellSize + 2);
  const height = 7 * (cellSize + 2);

  // Clear previous SVG
  d3.select(container).select("svg").remove();
  d3.select(container).select(".tooltip").remove();

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const maxValue = Math.max(...workoutData.map((d) => d.value), 1);
  const colorScale = d3
    .scaleLinear()
    .domain([0, maxValue])
    .range(["#ebedf0", "#003f17"]);

  const days = d3.timeDays(startDate, endDate);
  const formatTime = d3.timeFormat("%Y-%m-%d");
  const formatMonthFull = d3.timeFormat("%B");
  const dataMap = new Map(workoutData.map((d) => [d.date, d.value]));

  // Add month labels
  const months = d3.timeMonths(startDate, endDate);
  svg
    .selectAll(".month-label")
    .data(months)
    .enter()
    .append("text")
    .attr("class", "month-label")
    .attr("x", (d) => d3.timeWeek.count(startDate, d) * (cellSize + 2))
    .attr("y", -5)
    .attr("fill", "#444")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .text((d) => formatMonthFull(d));

  // Create Tooltip
  const tooltip = d3
    .select(container)
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.8)")
    .style("color", "#fff")
    .style("padding", "8px 12px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("z-index", 9999)
    .style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)");

  // Generate heatmap cells
  svg
    .selectAll(".day")
    .data(days)
    .enter()
    .append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", (d) => d3.timeWeek.count(startDate, d) * (cellSize + 2))
    .attr("y", (d) => d.getDay() * (cellSize + 2))
    .attr("fill", (d) => colorScale(dataMap.get(formatTime(d)) || 0))
    .on("mouseover", function (event, d) {
      const checkins = dataMap.get(formatTime(d)) || 0;
      tooltip
        .html(`${formatTime(d)}<br>Check-ins: ${checkins}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`)
        .style("opacity", 1);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`);
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });
}
</script>

<style scoped>
.heatmap-container {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.tooltip {
  transition: opacity 0.2s ease;
}
</style>