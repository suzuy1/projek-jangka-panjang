<script setup lang="ts">
import { User, Bell, Lock, Save, Camera, Loader2, Trash2 } from 'lucide-vue-next';
import { useUserStore } from '~/stores/user';

const { addToast } = useToast();
const userStore = useUserStore();
const supabase = useSupabaseClient();
const activeTab = ref('profile');

// Clone data user ke local state form
const formData = ref({
  firstName: userStore.user.firstName,
  lastName: userStore.user.lastName,
  email: userStore.user.email,
  bio: userStore.user.bio,
  avatar: userStore.user.avatar, // URL Gambar saat ini
  notifications: { email: true, push: false }
});

const isSaving = ref(false);
const isUploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// Trigger klik input file tersembunyi
const triggerFileInput = () => {
  fileInput.value?.click();
};

// --- LOGIC UPLOAD AVATAR KE SUPABASE STORAGE ---
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // 1. Validasi File
  if (!file.type.startsWith('image/')) {
    addToast('Please select a valid image file (JPG, PNG)', 'error');
    return;
  }
  if (file.size > 2 * 1024 * 1024) { // 2MB Limit
    addToast('File size too big (Max 2MB)', 'error');
    return;
  }

  isUploading.value = true;
  
  try {
    // 2. Generate Nama File Unik
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    // 3. Upload ke Bucket 'avatars'
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 4. Ambil Public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // 5. Update Preview di Form
    formData.value.avatar = data.publicUrl;
    addToast('Image uploaded successfully! Click Save to apply.', 'success');

  } catch (error: any) {
    addToast('Upload failed: ' + error.message, 'error');
  } finally {
    isUploading.value = false;
    // Reset input agar bisa pilih file yang sama jika perlu
    if (fileInput.value) fileInput.value.value = '';
  }
};

// --- LOGIC HAPUS AVATAR (Balik ke Default) ---
const removeAvatar = () => {
  formData.value.avatar = `https://ui-avatars.com/api/?name=${formData.value.firstName}+${formData.value.lastName}&background=0D8ABC&color=fff`;
  addToast('Avatar reset to default. Click Save to apply.', 'info');
};

// --- LOGIC SAVE PROFILE ---
const handleSave = async () => {
  isSaving.value = true;
  
  try {
    // Update data via Store (yang akan sync ke Supabase Auth Metadata)
    await userStore.updateUser({
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      email: formData.value.email,
      bio: formData.value.bio,
      avatar: formData.value.avatar
    });
    
    addToast('Profile updated & synced to Cloud!', 'success');
  } catch (error: any) {
    addToast('Failed to update profile: ' + error.message, 'error');
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="max-w-5xl mx-auto w-full">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
      <p class="text-slate-500 dark:text-slate-400">Manage your account preferences and profile.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div class="lg:col-span-1">
        <nav class="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
          <button 
            @click="activeTab = 'profile'" 
            :class="`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`"
          >
            <User :size="18" /> My Profile
          </button>
          <button 
            @click="activeTab = 'notifications'" 
            :class="`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'notifications' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`"
          >
            <Bell :size="18" /> Notifications
          </button>
          <button 
            @click="activeTab = 'security'" 
            :class="`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'security' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`"
          >
            <Lock :size="18" /> Security
          </button>
        </nav>
      </div>

      <div class="lg:col-span-3">
        
        <div v-if="activeTab === 'profile'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Personal Information</h2>
          
          <div class="flex flex-col sm:flex-row items-center gap-6 mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <div class="relative group">
              <img 
                :src="formData.avatar" 
                :class="`w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-md object-cover transition-all ${isUploading ? 'opacity-50 grayscale' : ''}`" 
                alt="Avatar"
              >
              
              <div v-if="isUploading" class="absolute inset-0 flex items-center justify-center">
                 <Loader2 class="w-8 h-8 text-blue-600 animate-spin" />
              </div>

              <button 
                v-else 
                @click="triggerFileInput"
                class="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-full text-white shadow-sm transition-colors"
                title="Change Photo"
              >
                <Camera :size="16" />
              </button>

              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange">
            </div>

            <div class="text-center sm:text-left flex-1">
              <h3 class="font-medium text-slate-900 dark:text-white">Profile Picture</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">Supports PNG, JPG. Max size 2MB.</p>
              <div class="flex gap-2 justify-center sm:justify-start">
                <button @click="triggerFileInput" class="text-xs font-medium px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                  Upload New
                </button>
                <button @click="removeAvatar" class="text-xs font-medium px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors flex items-center gap-1">
                  <Trash2 :size="12" /> Remove
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <AppInput v-model="formData.firstName" label="First Name" placeholder="e.g. John" />
            <AppInput v-model="formData.lastName" label="Last Name" placeholder="e.g. Doe" />
            
            <div class="md:col-span-2">
              <AppInput v-model="formData.email" type="email" label="Email Address" disabled help-text="Email cannot be changed via dashboard." />
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bio</label>
              <textarea 
                v-model="formData.bio" 
                rows="4" 
                placeholder="Tell us a little about yourself..."
                class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all resize-none"
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
            <AppButton @click="handleSave" :loading="isSaving" variant="primary">
              <template #icon><Save :size="18" /></template>
              Save Changes
            </AppButton>
          </div>
        </div>
        
        <div v-if="activeTab === 'notifications'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
           <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Notification Preferences</h2>
           <div class="space-y-4">
             <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <div>
                  <p class="font-medium text-slate-900 dark:text-white">Email Notifications</p>
                  <p class="text-xs text-slate-500">Receive daily summary emails.</p>
                </div>
                <input type="checkbox" class="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-slate-700" v-model="formData.notifications.email">
             </div>
             </div>
        </div>

        <div v-if="activeTab === 'security'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
           <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Security Settings</h2>
           <p class="text-sm text-slate-500">Change password and 2FA settings here (Coming Soon).</p>
        </div>

      </div>
    </div>
  </div>
</template>