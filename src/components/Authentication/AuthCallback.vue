 <template>
  <v-container class="d-flex align-center justify-center" style="height: 100vh">
    <v-card class="pa-4" max-width="400">
      <v-card-title class="text-center">Finishing login...</v-card-title>
      <v-card-text class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/composables/supabase';

const router = useRouter();
const userStore = useUserStore();

onMounted(async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    if (session) {
      await userStore.insertProfile(session);
      userStore.setUserSession(session);
      router.push('/');
    } else {
      router.push('/login');
    }
  } catch (error) {
    console.error('Error during auth callback:', error);
    router.push('/login');
  }
});
</script>