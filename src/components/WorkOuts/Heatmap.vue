<template>
  <div>
    <label for="year-select">Select Year:</label>
    <select id="year-select" v-model="selectedYear" @change="updateYear" class="year-dropdown">
      <option value="current">Current</option>
      <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
    </select>
    <div ref="heatmapContainer"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from "vue";
import * as d3 from "d3";

const heatmapContainer = ref(null);
const data = ref([]);
const availableYears = ref([2022, 2023, 2024, 2025]);
const selectedYear = ref("current");

onMounted(async () => {
  await updateYear();
});

async function fetchHeatmapData(startDate, endDate) {
  let dataset = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dataset.push({ date: currentDate.toISOString().split("T")[0], value: Math.floor(Math.random() * 5) });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dataset;
}

async function updateYear() {
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

  data.value = await fetchHeatmapData(startDate, endDate);
  await nextTick();
  renderHeatmap(startDate, endDate);
}

function renderHeatmap(startDate, endDate) {
  const margin = { top: 20, right: 20, bottom: 20, left: 50 };
  const cellSize = 15;
  const width = 53 * (cellSize + 2);
  const height = 7 * (cellSize + 2);

  d3.select(heatmapContainer.value).select("svg").remove();

  const svg = d3
    .select(heatmapContainer.value)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const colorScale = d3
    .scaleLinear()
    .domain([0, 4])
    .range(["#ebedf0", "#216e39"]);

  const days = d3.timeDays(startDate, endDate);
  const formatTime = d3.timeFormat("%Y-%m-%d");
  const formatMonth = d3.timeFormat("%b");
  const dataMap = new Map(data.value.map(d => [d.date, d.value]));

  svg.selectAll(".month-label")
    .data(d3.timeMonths(startDate, endDate))
    .enter()
    .append("text")
    .attr("class", "month-label")
    .attr("x", d => d3.timeWeek.count(startDate, d) * (cellSize + 2))
    .attr("y", -5)
    .text(d => formatMonth(d));

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "#000")
    .style("color", "#fff")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("font-size", "12px");

  svg.selectAll(".day")
    .data(days)
    .enter()
    .append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", d => d3.timeWeek.count(startDate, d) * (cellSize + 2))
    .attr("y", d => d.getDay() * (cellSize + 2))
    .attr("fill", d => colorScale(dataMap.get(formatTime(d)) || 0))
    .on("mouseover", function (event, d) {
      tooltip.style("visibility", "visible")
        .text(`${formatTime(d)}: ${dataMap.get(formatTime(d)) || 0} contributions`);
    })
    .on("mousemove", function (event) {
      tooltip.style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden");
    });
}
</script>

<style>
.year-dropdown {
  background-color: var(--dropdown-bg, #f0f0f0);
  color: var(--dropdown-text, #333);
  border: 1px solid var(--dropdown-border, #ccc);
  padding: 5px;
  border-radius: 5px;
}

rect.day:hover {
  stroke: #333;
  stroke-width: 1px;
}

.tooltip {
  position: absolute;
  visibility: hidden;
  background: #000;
  color: #fff;
  padding: 5px;
  border-radius: 5px;
  font-size: 12px;
}

.month-label {
  font-size: 12px;
  fill: #555;
  text-anchor: start;
}
</style>
