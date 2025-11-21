<script setup lang="ts">
import { ref } from 'vue';
import { User, Bell, Lock, Save, Camera } from 'lucide-vue-next';
// Pastikan path ke store sudah benar sesuai struktur project Anda
import { useUserStore } from '~/stores/user'; 

// Asumsi ada composable useToast() yang sudah didefinisikan di project
// Jika tidak ada, Anda perlu mendefinisikannya atau menghapus baris yang berkaitan dengan addToast
// const { addToast } = useToast();
const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    console.log(`Toast: ${message} (${type})`);
};

const userStore = useUserStore(); 
const activeTab = ref('profile');

// Ref untuk input file HTML yang tersembunyi
const fileInput = ref<HTMLInputElement | null>(null);

// State untuk data form
const formData = ref({
  firstName: userStore.user.firstName,
  lastName: userStore.user.lastName,
  email: userStore.user.email,
  bio: userStore.user.bio,
  // Tambahkan field avatar di form sementara untuk preview
  avatar: userStore.user.avatar, 
  // Asumsi notifikasi adalah bagian dari formData lokal, bukan dari store user
  notifications: { email: true, push: false } 
});

const isSaving = ref(false);

// 1. Fungsi Trigger: Saat tombol kamera atau link upload diklik
const triggerFileInput = () => {
  fileInput.value?.click();
};

// 2. Fungsi Handle File: Saat user memilih file
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    // Validasi Tipe File (Harus Gambar)
    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPG/PNG)', 'error');
      target.value = ''; // Reset input
      return;
    }

    // Validasi Ukuran (Max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      addToast('File size is too large. Max 2MB allowed.', 'error');
      target.value = ''; // Reset input
      return;
    }

    // Buat URL Preview Sementara menggunakan URL.createObjectURL()
    const objectUrl = URL.createObjectURL(file);
    formData.value.avatar = objectUrl; // Tampilkan di UI
    
    addToast('Photo selected! Click Save to apply.', 'info');
  }
};

const handleSave = () => {
  isSaving.value = true;
  // Simulasikan delay API call selama 1 detik
  setTimeout(() => {
    // 4. SAAT SAVE: Kirim URL foto baru ke Store
    userStore.updateUser({
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      email: formData.value.email,
      bio: formData.value.bio,
      avatar: formData.value.avatar // Kirim URL foto baru (atau temporary URL)
    });

    isSaving.value = false;
    addToast('Profile updated successfully!', 'success');
  }, 1000);
};
</script>

<template>
  <div class="max-w-7xl mx-auto w-full">
    
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
      <p class="text-slate-500 dark:text-slate-400">Manage your account settings.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      <div class="lg:col-span-1">
        <nav class="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
          <!-- Navigasi Tab -->
          <button 
            @click="activeTab = 'profile'"
            :class="`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`"
          >
            <User :size="18" /> My Profile
          </button>
          <button 
            @click="activeTab = 'notifications'"
            :class="`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'notifications' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`"
          >
            <Bell :size="18" /> Notifications
          </button>
            <button 
            @click="activeTab = 'password'"
            :class="`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'password' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`"
          >
            <Lock :size="18" /> Password
          </button>
        </nav>
      </div>

      <div class="lg:col-span-3">
        
        <div v-if="activeTab === 'profile'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Personal Information</h2>
          
          <!-- START: Avatar Section dengan Upload Handler -->
          <div class="flex flex-col sm:flex-row items-center gap-6 mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            
            <!-- Area Avatar yang bisa diklik -->
            <div class="relative group cursor-pointer" @click="triggerFileInput">
              <img 
                :src="formData.avatar" 
                class="w-20 h-20 rounded-full border-4 border-white dark:border-slate-800 shadow-sm object-cover transition-opacity group-hover:opacity-75" 
                alt="Avatar"
              >
              
              <!-- Tombol Kamera (Overlay) -->
              <button class="absolute bottom-0 right-0 bg-white dark:bg-slate-700 p-1.5 rounded-full border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 group-hover:border-blue-200 transition-all shadow-sm">
                <Camera :size="14" />
              </button>

              <!-- Input File Tersembunyi -->
              <input 
                ref="fileInput"
                type="file" 
                accept="image/*" 
                class="hidden"
                @change="handleFileChange"
              >
            </div>

            <!-- Teks dan Tombol Upload -->
            <div class="text-center sm:text-left">
              <h3 class="font-medium text-slate-900 dark:text-white">Profile Picture</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-2">Supports PNG, JPG. Max size 2MB.</p>
              
              <button 
                @click="triggerFileInput"
                class="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
              >
                Click to upload
              </button>
            </div>
          </div>
          <!-- END: Avatar Section dengan Upload Handler -->


          <!-- START: Bagian Form Inputs -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            <AppInput 
              v-model="formData.firstName"
              label="First Name"
              placeholder="Enter your first name"
            />

            <AppInput 
              v-model="formData.lastName"
              label="Last Name"
              placeholder="Enter your last name"
            />

            <div class="md:col-span-2">
              <AppInput 
                v-model="formData.email"
                type="email"
                label="Email Address"
                placeholder="you@company.com"
                help-text="We will never share your email with anyone else."
              />
            </div>

            <!-- Menggunakan AppInput untuk textarea Bio dengan tipe 'textarea' -->
            <div class="md:col-span-2">
              <AppInput
                v-model="formData.bio"
                type="textarea"
                label="Bio"
                placeholder="Brief description for your profile."
                rows="3"
                help-text="Brief description for your profile."
                :show-help-text-right="true"
              />
            </div>

          </div>
          <!-- END: Bagian Form Inputs -->

          <div class="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
            <AppButton 
              @click="handleSave" 
              :loading="isSaving" 
              variant="primary"
            >
              <template #icon>
                <Save :size="16" />
              </template>
              Save Changes
            </AppButton>
          </div>
        </div>

        <!-- Tab Notifications -->
        <div v-if="activeTab === 'notifications'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Notification Preferences</h2>
          <div class="space-y-6">
            <div class="flex items-center justify-between p-4 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div>
                <h3 class="text-sm font-medium text-slate-900 dark:text-white">Email Notifications</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Receive updates about your account activity.</p>
              </div>
              <button @click="formData.notifications.email = !formData.notifications.email" :class="`relative w-11 h-6 rounded-full transition-colors ${formData.notifications.email ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`">
                <span :class="`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.notifications.email ? 'translate-x-5' : ''}`"></span>
              </button>
            </div>
            </div>
        </div>
        
        <!-- Tab Password -->
        <div v-if="activeTab === 'password'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-10 shadow-sm text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
            <Lock :size="32" class="text-slate-400" />
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Change Password</h3>
          <p class="text-slate-500 dark:text-slate-400 mt-2">Security settings are coming soon in the next update.</p>
        </div>

      </div>
    </div>
  </div>
</template>