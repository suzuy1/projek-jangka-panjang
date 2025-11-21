export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore(); // Panggil store

  // Jika user BELUM login, dan mau masuk ke halaman selain Login
  if (userStore.isAuthenticated === false && to.path !== '/login') {
    return navigateTo('/login'); // Tendang ke halaman login
  }

  // Jika user SUDAH login, tapi iseng mau buka halaman Login lagi
  if (userStore.isAuthenticated === true && to.path === '/login') {
    return navigateTo('/'); // Balikin ke dashboard
  }
});