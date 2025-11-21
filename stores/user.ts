import { defineStore } from 'pinia';

// Parameter ke-3 di bawah nanti adalah konfigurasi persist
export const useUserStore = defineStore('user', () => {
  
  // 1. STATE
  const isAuthenticated = ref(false); // Status Login

  const user = ref({
    firstName: 'Senior',
    lastName: 'Developer',
    email: 'senior@dev.com',
    role: 'Administrator',
    bio: 'Full Stack Developer loving Nuxt 4.',
    avatar: 'https://ui-avatars.com/api/?name=Senior+Dev&background=0D8ABC&color=fff'
  });

  // 2. COMPUTED
  const fullName = computed(() => `${user.value.firstName} ${user.value.lastName}`);

  // 3. ACTIONS
  function login() {
    isAuthenticated.value = true;
  }

  function logout() {
    isAuthenticated.value = false;
  }

  function updateUser(newData: any) {
    user.value.firstName = newData.firstName;
    user.value.lastName = newData.lastName;
    user.value.email = newData.email;
    user.value.bio = newData.bio;
    
    // Logic Avatar Pintar:
    // 1. Jika ada file foto baru (dari upload), pakai itu.
    if (newData.avatar) {
      user.value.avatar = newData.avatar;
    } 
    // 2. Jika tidak upload foto, tapi nama berubah, update inisial di avatar default.
    else if (user.value.avatar.includes('ui-avatars.com')) {
      const nameUrl = `${newData.firstName}+${newData.lastName}`;
      user.value.avatar = `https://ui-avatars.com/api/?name=${nameUrl}&background=0D8ABC&color=fff`;
    }
  }

  return { user, isAuthenticated, login, logout, fullName, updateUser };

}, {
  // === INI KUNCI AGAR TIDAK RESET SAAT REFRESH ===
  persist: true 
});