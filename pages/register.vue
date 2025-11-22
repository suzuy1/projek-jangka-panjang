<script setup lang="ts">
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-vue-next';

definePageMeta({ layout: 'auth' });

const supabase = useSupabaseClient();
const router = useRouter();
const { addToast } = useToast();

const isLoading = ref(false);
const form = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const handleRegister = async () => {
  if (!form.value.fullName || !form.value.email || !form.value.password) {
    addToast('Please fill in all fields', 'error');
    return;
  }
  if (form.value.password !== form.value.confirmPassword) {
    addToast('Passwords do not match', 'error');
    return;
  }

  isLoading.value = true;

  try {
    // 1. Sign Up ke Supabase
    const { data, error } = await supabase.auth.signUp({
      email: form.value.email,
      password: form.value.password,
      options: {
        // Metadata ini akan langsung tersimpan di user_metadata
        data: {
          first_name: form.value.fullName.split(' ')[0], // Ambil nama depan
          last_name: form.value.fullName.split(' ').slice(1).join(' ') || '', // Ambil sisa sebagai nama belakang
          role: 'User' // Default role
        }
      }
    });

    if (error) throw error;

    // 2. Cek apakah butuh verifikasi email (tergantung settingan Supabase Anda)
    if (data.session) {
      addToast('Registration successful! Welcome aboard.', 'success');
      router.push('/');
    } else {
      addToast('Registration successful! Please check your email to verify your account.', 'success');
      // Opsional: Redirect ke halaman login atau "check email" page
      setTimeout(() => router.push('/login'), 3000);
    }

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
        
        <div class="flex items-center gap-2 mb-8">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-200 dark:shadow-none">N</div>
          <span class="text-xl font-bold text-slate-900 dark:text-white">NuxtDash</span>
        </div>

        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create an account</h1>
          <p class="text-slate-500 dark:text-slate-400">Start your 30-day free trial. Cancel anytime.</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-5">
          
          <AppInput v-model="form.fullName" label="Full Name" placeholder="John Doe" required>
            <template #icon><User :size="20" /></template>
          </AppInput>

          <AppInput v-model="form.email" type="email" label="Email" placeholder="name@company.com" required>
            <template #icon><Mail :size="20" /></template>
          </AppInput>

          <AppInput v-model="form.password" type="password" label="Password" placeholder="Create a password" required>
            <template #icon><Lock :size="20" /></template>
          </AppInput>

          <AppInput v-model="form.confirmPassword" type="password" label="Confirm Password" placeholder="Repeat password" required>
            <template #icon><Lock :size="20" /></template>
          </AppInput>

          <button 
            type="submit" 
            :disabled="isLoading" 
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200 dark:shadow-none mt-2"
          >
            <Loader2 v-if="isLoading" class="animate-spin" :size="20" />
            <span v-else>Create Account</span>
            <ArrowRight v-if="!isLoading" :size="20" />
          </button>
        </form>

        <p class="mt-8 text-center text-sm text-slate-500">
          Already have an account? 
          <NuxtLink to="/login" class="text-blue-600 font-semibold hover:underline">Log in</NuxtLink>
        </p>
      </div>
    </div>

    <div class="hidden lg:block w-1/2 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
      <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" alt="Register Background" class="absolute inset-0 w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-end p-16 text-white">
        <h2 class="text-4xl font-bold mb-4">Join the community of <br/>expert developers.</h2>
        <p class="text-lg text-slate-200 max-w-md">Build faster, scale better, and manage your projects with ease.</p>
      </div>
    </div>
  </div>
</template>