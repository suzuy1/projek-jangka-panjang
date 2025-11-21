// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // 1. Tambahkan '@nuxtjs/color-mode' ke dalam array modules
  modules: ['@nuxtjs/tailwindcss', 
            '@nuxtjs/color-mode',
            '@pinia/nuxt',
            '@pinia-plugin-persistedstate/nuxt'
  ],

  // 2. Konfigurasi agar class CSS-nya bernama 'dark' (standar Tailwind)
  colorMode: {
    classSuffix: '', // PENTING: Biar outputnya class="dark", bukan class="dark-mode"
    preference: 'system', // Default ikut settingan laptop user
    fallback: 'light'
  },

  // 3. Opsional: Mengaktifkan behavior Nuxt 4
  future: {
    compatibilityVersion: 4,
  }
})