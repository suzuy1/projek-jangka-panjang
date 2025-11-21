<script setup lang="ts">
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-vue-next';
import { useUserStore } from '~/stores/user';

definePageMeta({ layout: 'auth' });

const userStore = useUserStore();
const router = useRouter();
const supabase = useSupabaseClient(); 

const showPassword = ref(false);
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const { addToast } = useToast();

const handleLogin = async () => {
  if (!email.value || !password.value) return;
  
  isLoading.value = true;
  
  // Login ke Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  isLoading.value = false;

  if (error) {
    addToast(error.message, 'error');
  } else {
    addToast('Login successful! Redirecting...', 'success');
    
    // PENTING: Set profil store dengan data dari Supabase
    if (data.user) {
      userStore.setProfile(data.user);
    }
    
    router.push('/');
  }
};
</script>

<template>
  <div class="flex min-h-screen">
    <div class="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-white dark:bg-slate-900 transition-colors">
      <div class="max-w-md mx-auto w-full">
        <div class="flex items-center gap-2 mb-10">
          <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none">N</div>
          <span class="text-2xl font-bold text-slate-900 dark:text-white">NuxtDash</span>
        </div>

        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back</h1>
          <p class="text-slate-500 dark:text-slate-400">Please enter your details to sign in.</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <AppInput v-model="email" type="email" label="Email Address" placeholder="admin@nuxtdash.com" required>
            <template #icon><Mail :size="20" /></template>
          </AppInput>

          <AppInput v-model="password" :type="showPassword ? 'text' : 'password'" label="Password" placeholder="••••••••" required>
            <template #icon><Lock :size="20" /></template>
            <template #right>
              <button type="button" @click="showPassword = !showPassword" class="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <component :is="showPassword ? EyeOff : Eye" :size="20" />
              </button>
            </template>
          </AppInput>

          <button type="submit" :disabled="isLoading" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200 dark:shadow-none">
            <span v-if="!isLoading">Sign in</span>
            <span v-else>Signing in...</span>
            <ArrowRight v-if="!isLoading" :size="20" />
          </button>
        </form>
      </div>
    </div>

    <div class="hidden lg:block w-1/2 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
      <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" alt="Login Background" class="absolute inset-0 w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent flex flex-col justify-end p-16 text-white">
        <h2 class="text-4xl font-bold mb-4">Turn your data into <br/>actionable insights.</h2>
        <p class="text-lg text-slate-200 max-w-md">Experience the next generation of admin dashboards built with Nuxt 4 technology.</p>
      </div>
    </div>
  </div>
</template>