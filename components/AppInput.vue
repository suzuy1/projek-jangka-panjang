<script setup lang="ts">
// Props Definition
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text' // text, email, password, etc.
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

// Emit untuk v-model
const emit = defineEmits(['update:modelValue']);

// Handle Input Change
const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <div class="w-full">
    <label 
      v-if="label" 
      class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
    >
      {{ label }}
    </label>

    <div class="relative">
      <div 
        v-if="$slots.icon" 
        class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      >
        <slot name="icon" />
      </div>

      <input
        :value="modelValue"
        @input="updateValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="`
          w-full py-2.5 rounded-xl border bg-white dark:bg-slate-800 dark:text-white text-sm transition-all
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed
          ${$slots.icon ? 'pl-10 pr-4' : 'px-4'}
          ${error 
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500 text-red-900 dark:text-red-400 placeholder-red-300' 
            : 'border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 text-slate-900 placeholder-slate-400'
          }
        `"
      />
      
      <div v-if="$slots.right" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
         <slot name="right" />
      </div>
    </div>

    <p v-if="error" class="mt-1 text-xs text-red-600 dark:text-red-400 font-medium animate-pulse">
      {{ error }}
    </p>

    <p v-else-if="helpText" class="mt-1 text-xs text-slate-500 dark:text-slate-400">
      {{ helpText }}
    </p>

  </div>
</template>