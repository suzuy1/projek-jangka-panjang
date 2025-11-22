<script setup lang="ts">
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-vue-next';

definePageMeta({ layout: 'auth' });

const supabase = useSupabaseClient();
const { addToast } = useToast();
const isLoading = ref(false);
const email = ref('');

const handleResetRequest = async () => {
  if (!email.value) {
    addToast('Please enter your email address', 'error');
    return;
  }

  isLoading.value = true;

  try {
    // URL redirect dinamis (localhost atau production)
    const redirectTo = `${window.location.origin}/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: redirectTo,
    });

    if (error) throw error;

    addToast('Reset link sent! Check your email.', 'success');
    
  } catch (error: any) {
    addToast(error.message, 'error');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex min-h-screen">
    <div class="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-white dark:bg-slate-900 transition-colors">
      <div class="max-w-md mx-auto w-full">
        
        <div class="mb-8">
          <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Mail :size="24" />
          </div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Forgot Password?</h1>
          <p class="text-slate-500 dark:text-slate-400">No worries, we'll send you reset instructions.</p>
        </div>

        <form @submit.prevent="handleResetRequest" class="space-y-5">
          <AppInput v-model="email" type="email" label="Email Address" placeholder="Enter your email" required>
            <template #icon><Mail :size="20" /></template>
          </AppInput>

          <button 
            type="submit" 
            :disabled="isLoading" 
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200 dark:shadow-none"
          >
            <Loader2 v-if="isLoading" class="animate-spin" :size="20" />
            <span v-else>Send Reset Link</span>
          </button>
        </form>

        <div class="mt-8 text-center">
          <NuxtLink to="/login" class="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft :size="16" /> Back to log in
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="hidden lg:block w-1/2 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
      <img src="https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?q=80&w=2670&auto=format&fit=crop" alt="Forgot Password" class="absolute inset-0 w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-16 text-white">
        <h2 class="text-4xl font-bold mb-4">Secure your account.</h2>
        <p class="text-lg text-slate-200">We take security seriously to protect your data and privacy.</p>
      </div>
    </div>
  </div>
</template>