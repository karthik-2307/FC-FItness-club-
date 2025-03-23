<template>
      <v-layout>
        <v-app-bar 
        image="https://cdn.vuetifyjs.com/images/backgrounds/bg-2.jpg"
        permanent
            theme="dark">
          <v-app-bar-nav-icon
            variant="text"
            @click.stop="drawer = !drawer"
          ></v-app-bar-nav-icon>
  
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
  
        <v-navigation-drawer
          v-model="drawer"
          :location="$vuetify.display.mobile ? 'bottom' : undefined"
           image="https://cdn.vuetifyjs.com/images/backgrounds/bg-2.jpg"
            theme="dark"
           permanent
           
        >
          <v-list density="compact">
            <v-list-item
              v-for="(item, i) in items"
              :key="i"
              :value="item"
              color="primary"
            >
                <v-btn :prepend-icon="item.icon" variant="plain">
                {{ item.text }}
              </v-btn>
  
            </v-list-item>
          </v-list>
          <template #append>
            <v-btn prepend-icon="mdi-logout" variant="plain"  @click="logout">Logout</v-btn>
          </template>
        </v-navigation-drawer>
  
        <v-main style="height:100%;">
          <Home/>
        </v-main>
      </v-layout>
  </template>
  
  <script setup lang="ts">
  import { eventBus } from '@/stores/eventbus';
  import { useUserStore } from "@/stores/userStore";
  const UserStore = useUserStore();
import Home from './Home.vue'
    import { ref, watch } from 'vue'
    import { useTheme } from 'vuetify'
    const theme = useTheme()
    const items = [
      {
        text: 'Work Outs',
        icon: 'mdi-dumbbell',
      },
      {
        text: 'Diet planning',
        icon: 'mdi-food',
      },
      {
        text: 'Community',
        icon: 'mdi-google-circles-communities',
      },
      {
        text: 'Chats',
        icon: 'mdi-message-text',
      },
      {
        text: 'Profile',
        icon: 'mdi-account',
      },
    ]
    const drawer = ref(false)
    const group = ref(null)
    const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  eventBus.emit('themeChanged');
};
const logout = () => {
  UserStore.logout();
};
const current_selected=ref("workout")
    watch(group, () => {
      drawer.value = false
    })
  </script>
  