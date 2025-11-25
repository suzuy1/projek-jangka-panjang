<script setup lang="ts">
import { Search, Filter, Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Mail, AlertTriangle, Loader2 } from 'lucide-vue-next';
import type { Customer } from '~/types/database'; 

const { addToast } = useToast();

// GUNAKAN SERVICE LAYER (Tidak ada lagi 'supabase' client disini)
const { 
  customers, 
  totalCount, 
  isLoading, 
  fetchCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer 
} = useCustomers();

// ... (State Search & Pagination TETAP SAMA seperti sebelumnya) ...
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 5;
const totalPages = computed(() => Math.ceil(totalCount.value / itemsPerPage) || 1);

onMounted(() => loadData());

const loadData = () => {
  fetchCustomers(currentPage.value, itemsPerPage, searchQuery.value);
};

// Watcher untuk search & pagination
let searchTimeout: NodeJS.Timeout;
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => { currentPage.value = 1; loadData(); }, 500);
});
watch(currentPage, () => loadData());

// ... (Logic Delete TETAP SAMA) ...
const isDeleteModalOpen = ref(false);
const selectedCustomerId = ref<number | null>(null);

const openDeleteModal = (id: number) => {
  selectedCustomerId.value = id;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  if (selectedCustomerId.value === null) return;
  try {
    await deleteCustomer(selectedCustomerId.value);
    addToast('Customer deleted successfully', 'success');
    loadData();
  } catch (e: any) {
    addToast(e.message, 'error');
  } finally {
    isDeleteModalOpen.value = false;
  }
};

// --- LOGIC FORM (YANG TADI ERROR) ---
const isFormModalOpen = ref(false);
const isSubmitting = ref(false);
const formMode = ref<'add' | 'edit'>('add');
// Default values
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
  formData.value = { ...customer }; // Clone data
  isFormModalOpen.value = true;
};

const handleSaveCustomer = async () => {
  if (!formData.value.name || !formData.value.email) {
    addToast('Please fill all fields', 'error');
    return;
  }

  isSubmitting.value = true;
  try {
    if (formMode.value === 'add') {
      // PANGGIL FUNGSI COMPOSABLE (Bukan supabase.insert langsung)
      await createCustomer({
        name: formData.value.name,
        email: formData.value.email,
        role: formData.value.role,
        status: formData.value.status
      });
      addToast('Customer added', 'success');
    } else {
      // PANGGIL FUNGSI COMPOSABLE (Bukan supabase.update langsung)
      await updateCustomer(formData.value.id, {
        name: formData.value.name,
        email: formData.value.email,
        role: formData.value.role,
        status: formData.value.status
      });
      addToast('Customer updated', 'success');
    }
    isFormModalOpen.value = false;
    loadData(); // Refresh
  } catch (e: any) {
    addToast(e.message, 'error');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Customers</h1>
        <p class="text-slate-500 dark:text-slate-400">Manage your user base (Server-side Pagination).</p>
      </div>
      <AppButton variant="primary" size="sm" @click="openAddModal">
        <template #icon><Plus :size="18" /></template>
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
            placeholder="Search..." 
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
        </div>
      </div>

      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 :size="32" class="animate-spin mb-2 text-blue-600" />
        <p>Fetching data...</p>
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
            <tr v-for="customer in customers" :key="customer.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
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
                  {{ customer.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{{ customer.role }}</td>
              <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {{ customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '-' }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AppButton variant="ghost" size="sm" @click="openEditModal(customer)"><Edit2 :size="16" class="text-blue-600" /></AppButton>
                  <AppButton variant="ghost" size="sm" @click="openDeleteModal(customer.id)"><Trash2 :size="16" class="text-red-600" /></AppButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!isLoading" class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <span class="text-sm text-slate-500">Page {{ currentPage }} of {{ totalPages }}</span>
        <div class="flex gap-2">
          <AppButton variant="secondary" size="sm" @click="currentPage > 1 ? currentPage-- : null" :disabled="currentPage === 1"><ChevronLeft :size="16" /></AppButton>
          <AppButton variant="secondary" size="sm" @click="currentPage < totalPages ? currentPage++ : null" :disabled="currentPage === totalPages"><ChevronRight :size="16" /></AppButton>
        </div>
      </div>
    </div>

    <AppModal :isOpen="isDeleteModalOpen" title="Delete Customer" type="danger" @close="isDeleteModalOpen = false" @confirm="confirmDelete">
       <p>Are you sure?</p>
    </AppModal>

    <AppModal :isOpen="isFormModalOpen" :title="formMode === 'add' ? 'Add' : 'Edit'" @close="isFormModalOpen = false" @confirm="handleSaveCustomer">
      <div class="space-y-4">
        <AppInput v-model="formData.name" label="Name" />
        <AppInput v-model="formData.email" label="Email" />
        <div class="grid grid-cols-2 gap-4">
           <select v-model="formData.role" class="w-full border p-2 rounded dark:bg-slate-800 dark:border-slate-600"><option>User</option><option>Editor</option><option>Admin</option></select>
           <select v-model="formData.status" class="w-full border p-2 rounded dark:bg-slate-800 dark:border-slate-600"><option>Active</option><option>Inactive</option></select>
        </div>
      </div>
    </AppModal>
  </div>
</template>