<script setup lang="ts">
import { Search, Filter, Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Mail, AlertTriangle, Save, X } from 'lucide-vue-next';

const { addToast } = useToast();

// --- 1. DATA DEFINITION ---
interface Customer {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

const customers = ref<Customer[]>([
  { id: 1, name: 'Budi Santoso', email: 'budi@example.com', role: 'Admin', status: 'Active', lastLogin: '2 mins ago' },
  { id: 2, name: 'Siti Aminah', email: 'siti@example.com', role: 'User', status: 'Active', lastLogin: '1 hour ago' },
  { id: 3, name: 'John Doe', email: 'john.doe@company.com', role: 'Editor', status: 'Inactive', lastLogin: '3 days ago' },
]);

// --- 2. SEARCH & PAGINATION ---
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 5;

const filteredCustomers = computed(() => {
  return customers.value.filter(c => 
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / itemsPerPage));
const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredCustomers.value.slice(start, end);
});

// --- 3. DELETE LOGIC ---
const isDeleteModalOpen = ref(false);
const selectedCustomerId = ref<number | null>(null);

const openDeleteModal = (id: number) => {
  selectedCustomerId.value = id;
  isDeleteModalOpen.value = true;
};

const confirmDelete = () => {
  if (selectedCustomerId.value !== null) {
    customers.value = customers.value.filter(c => c.id !== selectedCustomerId.value);
    isDeleteModalOpen.value = false;
    addToast('Customer deleted successfully', 'success');
    selectedCustomerId.value = null;
  }
};

// --- 4. ADD & EDIT LOGIC (NEW!) ---
const isFormModalOpen = ref(false);
const formMode = ref<'add' | 'edit'>('add'); // Penanda mode
const formData = ref({
  id: 0,
  name: '',
  email: '',
  role: 'User',
  status: 'Active' as 'Active' | 'Inactive'
});

// Fungsi Buka Modal ADD
const openAddModal = () => {
  formMode.value = 'add';
  // Reset form kosong
  formData.value = { id: 0, name: '', email: '', role: 'User', status: 'Active' };
  isFormModalOpen.value = true;
};

// Fungsi Buka Modal EDIT
const openEditModal = (customer: Customer) => {
  formMode.value = 'edit';
  // Copy data customer ke form (Spread operator biar gak reaktif langsung)
  formData.value = { ...customer, status: customer.status as 'Active' | 'Inactive' };
  isFormModalOpen.value = true;
};

// Fungsi Simpan (Create / Update)
const handleSaveCustomer = () => {
  // Validasi sederhana
  if (!formData.value.name || !formData.value.email) {
    addToast('Please fill in all required fields', 'error');
    return;
  }

  if (formMode.value === 'add') {
    // === LOGIC CREATE ===
    const newId = Math.max(...customers.value.map(c => c.id), 0) + 1; // Generate ID baru
    customers.value.unshift({
      id: newId,
      name: formData.value.name,
      email: formData.value.email,
      role: formData.value.role,
      status: formData.value.status,
      lastLogin: 'Just now'
    });
    addToast('New customer added successfully', 'success');
  } else {
    // === LOGIC UPDATE ===
    const index = customers.value.findIndex(c => c.id === formData.value.id);
    if (index !== -1) {
      customers.value[index] = { 
        ...customers.value[index], 
        ...formData.value 
      };
      addToast('Customer details updated', 'success');
    }
  }

  // Tutup Modal
  isFormModalOpen.value = false;
};
</script>

<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Customers</h1>
        <p class="text-slate-500 dark:text-slate-400">Manage your user base and permissions.</p>
      </div>
      <AppButton variant="primary" size="sm" @click="openAddModal">
        <template #icon>
          <Plus :size="18" />
        </template>
        Add Customer
      </AppButton>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      
      <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div class="relative w-full md:w-72">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search customers..." 
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
        </div>
        <AppButton variant="secondary">
          <template #icon> <Filter :size="16" /> </template>
          Filter
        </AppButton>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
              <th class="px-6 py-4">Customer</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4">Role</th>
              <th class="px-6 py-4">Last Login</th>
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
              <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{{ customer.lastLogin }}</td>
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
          </tbody>
        </table>
      </div>

      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <span class="text-sm text-slate-500 dark:text-slate-400">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredCustomers.length) }} of {{ filteredCustomers.length }} results
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
           <h4 class="font-medium text-slate-900 dark:text-white mb-1">Are you sure?</h4>
           <p class="text-sm text-slate-500 dark:text-slate-400">This action cannot be undone. This will permanently delete the customer data.</p>
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
        <AppInput 
          v-model="formData.name" 
          label="Full Name" 
          placeholder="e.g. John Doe" 
        />
        
        <AppInput 
          v-model="formData.email" 
          type="email"
          label="Email Address" 
          placeholder="e.g. john@company.com" 
        />

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
            <select 
              v-model="formData.role"
              class="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>User</option>
              <option>Editor</option>
              <option>Admin</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
            <select 
              v-model="formData.status"
              class="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
    </AppModal>

  </div>
</template>