<script setup lang="ts">
useHead({
  title: 'NuxtDash Pro',
  meta: [
    { name: 'description', content: 'Professional Dashboard built with Nuxt 4 & Tailwind' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})
</script>

<template>
  <div>
    <NuxtLoadingIndicator color="#2563eb" :height="3" />

    <AppToast /> 
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>