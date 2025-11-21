<script setup lang="ts">
import { Search, Filter, Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Mail, AlertTriangle, Loader2 } from 'lucide-vue-next';

const { addToast } = useToast();
const supabase = useSupabaseClient(); // Init Client Supabase

// --- 1. DATA DEFINITION ---
// Kita sesuaikan dengan kolom di Supabase
interface Customer {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  created_at?: string; // Kolom timestamp dari Supabase
}

// State Data (Awalnya kosong array)
const customers = ref<Customer[]>([]);
const isLoading = ref(true); // Loading state

// --- 2. FETCH DATA (READ) ---
// Fungsi mengambil data dari Supabase
const fetchCustomers = async () => {
  isLoading.value = true;
  
  // Query: Select Bintang (*) dan urutkan ID dari besar ke kecil (Terbaru di atas)
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    addToast('Failed to fetch data: ' + error.message, 'error');
  } else {
    customers.value = data as Customer[];
  }
  
  isLoading.value = false;
};

// Panggil fetch saat halaman pertama kali dibuka
onMounted(() => {
  fetchCustomers();
});


// --- 3. SEARCH & PAGINATION (Client Side Logic) ---
// (Bagian ini tidak berubah banyak, karena kita filter data yang sudah didownload)
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 5;

const filteredCustomers = computed(() => {
  return customers.value.filter(c => 
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / itemsPerPage) || 1);

// Reset halaman ke 1 jika search berubah
watch(searchQuery, () => currentPage.value = 1);

const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredCustomers.value.slice(start, end);
});


// --- 4. DELETE LOGIC (REAL) ---
const isDeleteModalOpen = ref(false);
const selectedCustomerId = ref<number | null>(null);

const openDeleteModal = (id: number) => {
  selectedCustomerId.value = id;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  if (selectedCustomerId.value !== null) {
    // Hapus di Supabase
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', selectedCustomerId.value);

    if (error) {
      addToast('Error deleting: ' + error.message, 'error');
    } else {
      addToast('Customer deleted successfully', 'success');
      // Refresh Data Tanpa Reload Page
      await fetchCustomers();
    }
    
    isDeleteModalOpen.value = false;
    selectedCustomerId.value = null;
  }
};


// --- 5. ADD & EDIT LOGIC (REAL) ---
const isFormModalOpen = ref(false);
const isSubmitting = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const formData = ref({
  id: 0,
  name: '',
  email: '',
  role: 'User',
  status: 'Active' as 'Active' | 'Inactive'
});

const openAddModal = () => {
  formMode.value = 'add';
  formData.value = { id: 0, name: '', email: '', role: 'User', status: 'Active' };
  isFormModalOpen.value = true;
};

const openEditModal = (customer: Customer) => {
  formMode.value = 'edit';
  formData.value = { ...customer, status: customer.status as 'Active' | 'Inactive' };
  isFormModalOpen.value = true;
};

const handleSaveCustomer = async () => {
  if (!formData.value.name || !formData.value.email) {
    addToast('Please fill in all required fields', 'error');
    return;
  }

  isSubmitting.value = true;

  if (formMode.value === 'add') {
    // === CREATE (INSERT) ===
    // Kita tidak perlu kirim ID, karena Supabase "Is Identity" akan generate otomatis
    const { error } = await supabase.from('customers').insert({
      name: formData.value.name,
      email: formData.value.email,
      role: formData.value.role,
      status: formData.value.status
    });

    if (error) addToast('Error adding: ' + error.message, 'error');
    else addToast('New customer added successfully', 'success');

  } else {
    // === UPDATE ===
    const { error } = await supabase
      .from('customers')
      .update({
        name: formData.value.name,
        email: formData.value.email,
        role: formData.value.role,
        status: formData.value.status
      })
      .eq('id', formData.value.id); // Cari berdasarkan ID

    if (error) addToast('Error updating: ' + error.message, 'error');
    else addToast('Customer updated successfully', 'success');
  }

  isSubmitting.value = false;
  isFormModalOpen.value = false;
  
  // Refresh data tabel
  await fetchCustomers();
};
</script>

<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Customers</h1>
        <p class="text-slate-500 dark:text-slate-400">Manage your user base via Supabase.</p>
      </div>
      <AppButton variant="primary" size="sm" @click="openAddModal">
        <template #icon>
          <Plus :size="18" />
        </template>
        Add Customer
      </AppButton>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[300px]">
      
      <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div class="relative w-full md:w-72">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search database..." 
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
        </div>
        <AppButton variant="secondary">
          <template #icon> <Filter :size="16" /> </template>
          Filter
        </AppButton>
      </div>

      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 :size="32" class="animate-spin mb-2 text-blue-600" />
        <p>Loading data from Supabase...</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
              <th class="px-6 py-4">Customer</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4">Role</th>
              <th class="px-6 py-4">Created At</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-for="customer in paginatedCustomers" :key="customer.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img :src="`https://ui-avatars.com/api/?name=${customer.name}&background=random&color=fff`" class="w-10 h-10 rounded-full">
                  <div>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">{{ customer.name }}</p>
                    <div class="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Mail :size="10" /> {{ customer.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'}`">
                  <span :class="`w-1.5 h-1.5 rounded-full mr-1.5 ${customer.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-500'}`"></span>
                  {{ customer.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{{ customer.role }}</td>
              <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {{ customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '-' }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AppButton variant="ghost" size="sm" @click="openEditModal(customer)">
                     <Edit2 :size="16" class="text-blue-600" />
                  </AppButton>
                  <AppButton variant="ghost" size="sm" @click="openDeleteModal(customer.id)">
                     <Trash2 :size="16" class="text-red-600" />
                  </AppButton>
                </div>
              </td>
            </tr>
            
            <tr v-if="paginatedCustomers.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                No data found. Try adding a new customer.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!isLoading" class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <span class="text-sm text-slate-500 dark:text-slate-400">
           Page {{ currentPage }} of {{ totalPages }}
        </span>
        <div class="flex gap-2">
          <AppButton variant="secondary" size="sm" @click="currentPage > 1 ? currentPage-- : null" :disabled="currentPage === 1">
            <ChevronLeft :size="16" />
          </AppButton>
          <AppButton variant="secondary" size="sm" @click="currentPage < totalPages ? currentPage++ : null" :disabled="currentPage === totalPages">
            <ChevronRight :size="16" />
          </AppButton>
        </div>
      </div>
    </div>

    <AppModal 
      :isOpen="isDeleteModalOpen" 
      title="Delete Customer" 
      type="danger"
      @close="isDeleteModalOpen = false"
      @confirm="confirmDelete"
    >
       <div class="flex items-start gap-4">
         <div class="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-600 dark:text-red-400">
            <AlertTriangle :size="24" />
         </div>
         <div>
           <h4 class="font-medium text-slate-900 dark:text-white mb-1">Confirm Delete</h4>
           <p class="text-sm text-slate-500 dark:text-slate-400">Are you sure you want to remove this data from the database permanently?</p>
         </div>
       </div>
    </AppModal>

    <AppModal
      :isOpen="isFormModalOpen"
      :title="formMode === 'add' ? 'Add New Customer' : 'Edit Customer'"
      @close="isFormModalOpen = false"
      @confirm="handleSaveCustomer"
    >
      <div class="space-y-4">
        <AppInput v-model="formData.name" label="Full Name" />
        <AppInput v-model="formData.email" type="email" label="Email Address" />

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
            <select v-model="formData.role" class="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm">
              <option>User</option>
              <option>Editor</option>
              <option>Admin</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
            <select v-model="formData.status" class="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      <p v-if="isSubmitting" class="text-xs text-blue-600 mt-2 text-right animate-pulse">
        Syncing with Supabase...
      </p>
    </AppModal>

  </div>
</template>