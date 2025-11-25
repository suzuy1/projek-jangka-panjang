import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  const supabase = useSupabaseClient();

  // State: Default harus kosong/null untuk merepresentasikan "belum ada data"
  const isAuthenticated = ref(false);
  const user = ref({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    bio: '',
    avatar: ''
  });

  const fullName = computed(() => {
    if (!user.value.firstName) return 'Guest';
    return `${user.value.firstName} ${user.value.lastName}`.trim();
  });

  function setProfile(supabaseUser: any) {
    isAuthenticated.value = true;
    if (supabaseUser.email) user.value.email = supabaseUser.email;
    
    const meta = supabaseUser.user_metadata || {};
    user.value.firstName = meta.first_name || '';
    user.value.lastName = meta.last_name || '';
    user.value.avatar = meta.avatar_url || '';
    user.value.bio = meta.bio || '';
    user.value.role = meta.role || 'User';
  }

  function logout() {
    isAuthenticated.value = false;
    // Reset ke string kosong
    user.value = { firstName: '', lastName: '', email: '', role: '', bio: '', avatar: '' };
  }

  async function updateUser(newData: any) {
    // 1. Simpan state lama untuk rollback (jika perlu), 
    // tapi untuk integritas data, kita update state HANYA SETELAH sukses.
    
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: newData.firstName,
        last_name: newData.lastName,
        bio: newData.bio,
        avatar_url: newData.avatar
      }
    });

    if (error) {
      throw error; // Lempar error ke UI component
    }

    // 2. Jika sukses, baru update state lokal
    // Ini disebut "Pessimistic UI Update" - lebih lambat sedetik, tapi data DIJAMIN akurat.
    user.value.firstName = newData.firstName;
    user.value.lastName = newData.lastName;
    user.value.bio = newData.bio;
    if (newData.avatar) user.value.avatar = newData.avatar;
  }

  return { user, isAuthenticated, setProfile, logout, fullName, updateUser };
}, {
  persist: true
});