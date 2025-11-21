<script setup lang="ts">
import { CheckCircle, AlertCircle, Info, X } from 'lucide-vue-next';

const { toasts, removeToast } = useToast();

// Helper icon berdasarkan tipe
const getIcon = (type: string) => {
  if (type === 'success') return CheckCircle;
  if (type === 'error') return AlertCircle;
  return Info;
};

// Helper warna berdasarkan tipe
const getStyles = (type: string) => {
  if (type === 'success') return 'bg-white dark:bg-slate-800 border-l-4 border-emerald-500 text-emerald-600 dark:text-emerald-400';
  if (type === 'error') return 'bg-white dark:bg-slate-800 border-l-4 border-red-500 text-red-600 dark:text-red-400';
  return 'bg-white dark:bg-slate-800 border-l-4 border-blue-500 text-blue-600 dark:text-blue-400';
};
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-xs">
    
    <TransitionGroup 
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-x-full opacity-0"
      enter-to-class="transform translate-x-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-x-0 opacity-100"
      leave-to-class="transform translate-x-full opacity-0"
    >
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        :class="`flex items-center p-4 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 ${getStyles(toast.type)}`"
      >
        <component :is="getIcon(toast.type)" class="w-5 h-5 flex-shrink-0" />
        
        <div class="ml-3 text-sm font-medium text-slate-800 dark:text-white">
          {{ toast.message }}
        </div>

        <button 
          @click="removeToast(toast.id)"
          class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white focus:ring-2 focus:ring-slate-300"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>

  </div>
</template>