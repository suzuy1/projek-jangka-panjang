<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';

// Props Configuration
const props = defineProps({
  // Tipe Tombol
  variant: {
    type: String as PropType<'primary' | 'secondary' | 'danger' | 'ghost'>,
    default: 'primary'
  },
  // Ukuran
  size: {
    type: String as PropType<'sm' | 'md' | 'lg'>,
    default: 'md'
  },
  // Status Loading
  loading: {
    type: Boolean,
    default: false
  },
  // Disable manual
  disabled: {
    type: Boolean,
    default: false
  },
  // Tipe HTML Button
  type: {
    type: String as PropType<'button' | 'submit' | 'reset'>,
    default: 'button'
  }
});

// Logic Style Berdasarkan Variant
const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 dark:shadow-none border border-transparent';
    case 'secondary':
      return 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700';
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200 dark:shadow-none border border-transparent';
    case 'ghost':
      return 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200';
    default:
      return '';
  }
});

// Logic Style Berdasarkan Size
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-xs';
    case 'md':
      return 'px-4 py-2 text-sm';
    case 'lg':
      return 'px-6 py-3 text-base';
    default:
      return 'px-4 py-2 text-sm';
  }
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="`
      inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900
      disabled:opacity-60 disabled:cursor-not-allowed
      ${variantClasses}
      ${sizeClasses}
      ${variant === 'primary' ? 'focus:ring-blue-500' : 'focus:ring-slate-400'}
    `"
  >
    <Loader2 
      v-if="loading" 
      class="mr-2 animate-spin" 
      :size="size === 'sm' ? 14 : 18" 
    />
    
    <span v-if="$slots.icon && !loading" class="mr-2 flex items-center">
      <slot name="icon" />
    </span>

    <slot />

  </button>
</template>