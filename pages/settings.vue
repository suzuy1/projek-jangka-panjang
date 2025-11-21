<script setup lang="ts">
import { User, Bell, Lock, Save, Camera } from 'lucide-vue-next';
import { useUserStore } from '~/stores/user';

const { addToast } = useToast();
const userStore = useUserStore();
const supabase = useSupabaseClient();
const activeTab = ref('profile');

const formData = ref({
  firstName: userStore.user.firstName,
  lastName: userStore.user.lastName,
  email: userStore.user.email,
  bio: userStore.user.bio,
  avatar: userStore.user.avatar, // URL Gambar
  notifications: { email: true, push: false }
});

const isSaving = ref(false);
const isUploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// Trigger klik input file
const triggerFileInput = () => {
  fileInput.value?.click();
};

// Logic Upload ke Supabase Storage
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast('File size max 2MB', 'error');
      return;
    }

    isUploading.value = true;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      // Upload ke bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Ambil Public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update form preview
      formData.value.avatar = data.publicUrl;
      addToast('Image uploaded! Click Save to apply.', 'success');

    } catch (error: any) {
      addToast('Upload failed: ' + error.message, 'error');
    } finally {
      isUploading.value = false;
    }
  }
};

// Logic Save ke Supabase Metadata
const handleSave = async () => {
  isSaving.value = true;
  
  try {
    await userStore.updateUser({
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      email: formData.value.email,
      bio: formData.value.bio,
      avatar: formData.value.avatar
    });
    addToast('Profile updated & synced to Cloud!', 'success');
  } catch (error) {
    addToast('Failed to update profile', 'error');
  } finally {
    isSaving.value = false;
  }
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
          <button @click="activeTab = 'profile'" :class="`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`">
            <User :size="18" /> My Profile
          </button>
          <button @click="activeTab = 'notifications'" :class="`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'notifications' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`">
            <Bell :size="18" /> Notifications
          </button>
        </nav>
      </div>

      <div class="lg:col-span-3">
        <div v-if="activeTab === 'profile'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Personal Information</h2>
          
          <div class="flex flex-col sm:flex-row items-center gap-6 mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <div class="relative group cursor-pointer" @click="triggerFileInput">
              <img :src="formData.avatar" :class="`w-20 h-20 rounded-full border-4 border-white dark:border-slate-800 shadow-sm object-cover transition-all group-hover:opacity-75 ${isUploading ? 'opacity-50 grayscale' : ''}`" alt="Avatar">
              <div v-if="isUploading" class="absolute inset-0 flex items-center justify-center">
                 <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <button v-else class="absolute bottom-0 right-0 bg-white dark:bg-slate-700 p-1.5 rounded-full border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 shadow-sm">
                <Camera :size="14" />
              </button>
              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange">
            </div>
            <div class="text-center sm:text-left">
              <h3 class="font-medium text-slate-900 dark:text-white">Profile Picture</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-2">Supports PNG, JPG. Max size 2MB.</p>
              <button @click="triggerFileInput" class="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline">Click to upload</button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <AppInput v-model="formData.firstName" label="First Name" />
            <AppInput v-model="formData.lastName" label="Last Name" />
            <div class="md:col-span-2">
              <AppInput v-model="formData.email" type="email" label="Email Address" disabled help-text="Email cannot be changed via dashboard." />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bio</label>
              <textarea v-model="formData.bio" rows="3" class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"></textarea>
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
            <AppButton @click="handleSave" :loading="isSaving" variant="primary">
              <template #icon><Save :size="16" /></template>
              Save Changes
            </AppButton>
          </div>
        </div>
        
        <div v-if="activeTab === 'notifications'" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
           <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Notification Preferences</h2>
           <p class="text-slate-500">Notification settings here...</p>
        </div>
      </div>
    </div>
  </div>
</template>