<script setup lang="ts">
const userStore = useUserStore();
const supabase = useSupabaseClient();

// SETIAP KALI APLIKASI DIBUKA / REFRESH:
onMounted(async () => {
  // Cek apakah ada user yang sedang login di session Supabase?
  const { data } = await supabase.auth.getUser();
  
  if (data.user) {
    // Jika ada, paksa store update dengan data terbaru dari cloud
    // (Termasuk URL avatar yang mungkin berubah dari device lain)
    userStore.setProfile(data.user); 
  }
});

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