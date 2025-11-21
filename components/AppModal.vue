<script setup lang="ts">
import { X } from 'lucide-vue-next';

// Props untuk mengontrol Modal
defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Confirmation'
  },
  type: {
    type: String,
    default: 'neutral' // neutral | danger
  }
});

// Emit event ke parent
const emit = defineEmits(['close', 'confirm']);
</script>

<template>
  <Teleport to="body">
    
    <Transition 
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
        @click="emit('close')"
      >
        
        <div 
          class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700 transform transition-all scale-100"
          @click.stop
        >
          
          <div class="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
            <h3 class="font-bold text-lg text-slate-900 dark:text-white">{{ title }}</h3>
            <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X :size="20" />
            </button>
          </div>

          <div class="p-6 text-slate-600 dark:text-slate-300">
            <slot />
          </div>

          <!-- Bagian Footer yang Diperbarui -->
          <div class="p-4 bg-slate-50 dark:bg-slate-700/30 flex justify-end gap-3">
            <AppButton variant="secondary" @click="emit('close')">
              Cancel
            </AppButton>
            
            <AppButton 
              :variant="type === 'danger' ? 'danger' : 'primary'" 
              @click="emit('confirm')"
            >
              Confirm
            </AppButton>
          </div>
          <!-- END Bagian Footer yang Diperbarui -->

        </div>
      </div>
    </Transition>
  </Teleport>
</template>