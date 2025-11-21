import VueApexCharts from "vue3-apexcharts";

export default defineNuxtPlugin((nuxtApp) => {
  // Daftarkan komponen secara global agar bisa dipakai di mana saja
  nuxtApp.vueApp.use(VueApexCharts);
});