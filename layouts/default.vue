<script setup lang="ts">
import { Home, BarChart2, Users, Settings, Bell, Search, Moon, Sun, Menu, X, LogOut } from 'lucide-vue-next'; // TAMBAH LogOut
import { useUserStore } from '~/stores/user';
import { FileText } from 'lucide-vue-next';

// Import Store dan Inisialisasi
const userStore = useUserStore(); 
const router = useRouter(); // Inisialisasi Router

const colorMode = useColorMode();
const route = useRoute(); // Untuk mendeteksi perpindahan halaman

// State untuk Mobile Sidebar
const isSidebarOpen = ref(false);

// Fungsi Toggle
const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};

// Fungsi Logout
const handleLogout = () => {
  // 1. Panggil action logout di Store (isAuthenticated = false)
  userStore.logout();
  // 2. Redirect ke halaman login
  router.push('/login');
};

// Tutup sidebar otomatis saat pindah halaman (UX Best Practice)
watch(() => route.fullPath, () => {
  isSidebarOpen.value = false;
});

const menuItems = [
  { name: 'Overview', icon: Home, path: '/' },
  { name: 'Analytics', icon: BarChart2, path: '/analytics' },
  { name: 'Customers', icon: Users, path: '/customers' },
  { name: 'Invoices', icon: FileText, path: '/invoices' }, // <--- BARU
  { name: 'Settings', icon: Settings, path: '/settings' },
];
</script>

<template>
  <div class="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans transition-colors duration-300">
    
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false"
      class="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity"
    ></div>

    <aside 
      :class="`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 
        transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `"
    >
      <div class="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            N
          </div>
          <span class="text-xl font-bold text-slate-800 dark:text-white">NuxtDash</span>
        </div>
        
        <button 
          @click="isSidebarOpen = false" 
          class="md:hidden text-slate-500 hover:text-red-500 transition-colors"
        >
          <X :size="24" />
        </button>
      </div>

      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.name"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          active-class="bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-medium"
        >
          <component :is="item.icon" :size="20" />
          {{ item.name }}
        </NuxtLink>
      </nav>

      <!-- START: Bagian User Profile Sidebar + Tombol Logout -->
      <div class="p-4 border-t border-slate-100 dark:border-slate-700">
        <div class="flex items-center justify-between gap-3">
          
          <div class="flex items-center gap-3 overflow-hidden">
            <img :src="userStore.user.avatar" class="w-10 h-10 rounded-full flex-shrink-0 object-cover" alt="Profile">
            <div class="min-w-0">
              <p class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                {{ userStore.fullName }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                {{ userStore.user.role }}
              </p>
            </div>
          </div>

          <!-- Tombol Logout -->
          <button 
            @click="handleLogout"
            class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
            title="Sign Out"
          >
            <LogOut :size="18" />
          </button>

        </div>
      </div>
      <!-- END: Bagian User Profile Sidebar + Tombol Logout -->
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden relative w-full">
      
      <header class="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-6 transition-colors duration-300 flex-shrink-0 z-10">
        
        <div class="flex items-center gap-4 flex-1">
          
          <button 
            @click="isSidebarOpen = true" 
            class="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <Menu :size="24" />
          </button>

          <div class="relative w-full max-w-md hidden sm:block">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="20" />
            <input 
              type="text" 
              placeholder="Search data..." 
              class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
          </div>
        </div>

        <div class="flex items-center gap-2 md:gap-4">
          <button 
            @click="toggleTheme" 
            class="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <ClientOnly>
              <component :is="colorMode.value === 'dark' ? Sun : Moon" :size="20" />
              <template #fallback><div class="w-5 h-5" /></template>
            </ClientOnly>
          </button>

          <button class="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full relative">
            <Bell :size="20" />
            <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-auto p-4 md:p-6 w-full">
        <div class="mx-auto max-w-7xl">
           <slot />
        </div>
      </main>
    </div>
  </div>
</template>