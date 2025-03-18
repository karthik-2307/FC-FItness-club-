/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from "@/plugins";

// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";
import { createPinia } from "pinia";

const app = createApp(App);

// Create Pinia instance
const pinia = createPinia();
import CalendarHeatmap  from 'vue3-calendar-heatmap'

app.use(CalendarHeatmap )
// Use Pinia
app.use(pinia);

registerPlugins(app);

app.mount("#app");
