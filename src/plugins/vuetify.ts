/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Composables
import { createVuetify } from "vuetify";
import { eventBus } from "@/stores/eventbus";
import { ref } from "vue";
const theme=ref('light');
// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
eventBus.on('themeChanged',()=>{
  if(theme.value=='light')
  {
    theme.value='dark';
  }
  else
  theme.value='light';
})
export default createVuetify({
  theme: {
    defaultTheme: theme.value,
  },
});
