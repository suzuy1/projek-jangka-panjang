<script setup lang="ts">
import { Home, AlertTriangle, MoveLeft } from 'lucide-vue-next';

// Props 'error' otomatis disuntikkan oleh Nuxt
const props = defineProps({
  error: Object
});

// Fungsi untuk membersihkan error dan kembali ke Home
const handleError = () => {
  clearError({ redirect: '/' });
};
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-center px-4 transition-colors duration-300">
    
    <div class="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
    
    <div class="relative z-10 max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
      
      <div class="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 dark:text-red-400">
        <AlertTriangle :size="40" stroke-width="1.5" />
      </div>

      <h1 class="text-6xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
        {{ error?.statusCode }}
      </h1>

      <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
        Page not found
      </h2>
      
      <p class="text-slate-500 dark:text-slate-400 mb-8">
        Oops! The page you are looking for might have been removed or temporarily unavailable.
      </p>

      <div class="flex justify-center">
        <AppButton variant="primary" size="lg" @click="handleError">
          <template #icon>
            <MoveLeft :size="20" />
          </template>
          Back to Dashboard
        </AppButton>
      </div>

    </div>

    <p class="mt-8 text-sm text-slate-400 dark:text-slate-500 relative z-10">
      &copy; 2025 NuxtDash Pro. All rights reserved.
    </p>

  </div>
</template>