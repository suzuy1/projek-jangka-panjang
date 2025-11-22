<script setup lang="ts">
import { Lock, Save, Loader2 } from 'lucide-vue-next';

definePageMeta({ layout: 'auth' });

const supabase = useSupabaseClient();
const router = useRouter();
const { addToast } = useToast();

const isLoading = ref(false);
const password = ref('');
const confirmPassword = ref('');

const handleUpdatePassword = async () => {
  if (password.value !== confirmPassword.value) {
    addToast('Passwords do not match', 'error');
    return;
  }
  if (password.value.length < 6) {
    addToast('Password must be at least 6 characters', 'error');
    return;
  }

  isLoading.value = true;

  try {
    const { error } = await supabase.auth.updateUser({
      password: password.value
    });

    if (error) throw error;

    addToast('Password updated successfully! Please login again.', 'success');
    
    // Logout user untuk keamanan, lalu arahkan ke login
    await supabase.auth.signOut();
    router.push('/login');

  } catch (error: any) {
    addToast(error.message, 'error');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
      
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock :size="24" />
        </div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Set New Password</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-2">Please enter your new password below.</p>
      </div>

      <form @submit.prevent="handleUpdatePassword" class="space-y-5">
        <AppInput v-model="password" type="password" label="New Password" placeholder="••••••••" required>
          <template #icon><Lock :size="18" /></template>
        </AppInput>

        <AppInput v-model="confirmPassword" type="password" label="Confirm Password" placeholder="••••••••" required>
          <template #icon><Lock :size="18" /></template>
        </AppInput>

        <button 
          type="submit" 
          :disabled="isLoading" 
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
        >
          <Loader2 v-if="isLoading" class="animate-spin" :size="20" />
          <span v-else>Update Password</span>
        </button>
      </form>

    </div>
  </div>
</template>