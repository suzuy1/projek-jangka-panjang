import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  const supabase = useSupabaseClient(); // Init Supabase Client

  // State
  const isAuthenticated = ref(false);
  const user = ref({
    firstName: 'Senior',
    lastName: 'Developer',
    email: 'senior@dev.com',
    role: 'Administrator',
    bio: 'Full Stack Developer loving Nuxt 4.',
    // Default avatar jika belum ada
    avatar: 'https://ui-avatars.com/api/?name=Senior+Dev&background=0D8ABC&color=fff'
  });

  // Computed
  const fullName = computed(() => `${user.value.firstName} ${user.value.lastName}`);

  // --- ACTIONS ---

  // 1. SET PROFILE: Dipanggil saat Login atau App Start
  // Mengambil data dari "Metadata" Supabase dan menyimpannya ke State Lokal
  function setProfile(supabaseUser: any) {
    isAuthenticated.value = true;
    
    if (supabaseUser.email) {
      user.value.email = supabaseUser.email;
    }
    
    // Ambil Metadata (Data tambahan yang nempel di akun user)
    const meta = supabaseUser.user_metadata || {};

    if (meta.first_name) user.value.firstName = meta.first_name;
    if (meta.last_name) user.value.lastName = meta.last_name;
    if (meta.avatar_url) user.value.avatar = meta.avatar_url;
    if (meta.bio) user.value.bio = meta.bio;
  }

  // 2. LOGOUT: Reset data
  function logout() {
    isAuthenticated.value = false;
    user.value.firstName = 'Senior'; 
    user.value.lastName = 'Developer';
    user.value.avatar = 'https://ui-avatars.com/api/?name=Senior+Dev&background=0D8ABC&color=fff';
  }

  // 3. UPDATE USER: Simpan perubahan ke Supabase Cloud
  async function updateUser(newData: any) {
    // A. Update State Lokal dulu (biar UI responsif/cepat)
    user.value.firstName = newData.firstName;
    user.value.lastName = newData.lastName;
    user.value.bio = newData.bio;
    
    if (newData.avatar) {
      user.value.avatar = newData.avatar;
    }

    // B. Kirim data ke Supabase Auth Metadata (Sync ke Cloud)
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: newData.firstName,
        last_name: newData.lastName,
        bio: newData.bio,
        avatar_url: user.value.avatar // URL foto disimpan di sini
      }
    });

    if (error) {
      console.error('Gagal sync ke Supabase:', error.message);
      throw error; // Lempar error biar bisa ditangkap di UI
    }
  }

  return { user, isAuthenticated, setProfile, logout, fullName, updateUser };

}, {
  persist: true // Wajib: Biar gak ilang pas refresh
});