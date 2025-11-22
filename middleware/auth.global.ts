// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore();

  // --- UPDATE DI SINI ---
  // Tambahkan '/update-password' agar tidak ditendang middleware
  const publicRoutes = ['/login', '/register', '/forgot-password', '/update-password'];

  // 1. Jika user BELUM login, dan mau masuk ke halaman selain Public Routes
  if (!userStore.isAuthenticated && !publicRoutes.includes(to.path)) {
    return navigateTo('/login');
  }

  // 2. Jika user SUDAH login...
  // PENTING: Kita kecualikan '/update-password' dari redirect otomatis ke dashboard
  // supaya user bisa tetap di halaman reset password meski sudah terdeteksi login.
  if (userStore.isAuthenticated && ['/login', '/register', '/forgot-password'].includes(to.path)) {
    return navigateTo('/');
  }
});