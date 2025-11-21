<script setup lang="ts">
import { FileText, Plus, Search, Download, Save } from 'lucide-vue-next';

const supabase = useSupabaseClient();
const { addToast } = useToast();

// --- STATE ---
const invoices = ref([]);
const customerOptions = ref([]); // Untuk isi Dropdown
const isLoading = ref(true);
const isModalOpen = ref(false);
const isSubmitting = ref(false);

// Form Data
const formData = ref({
  customer_id: '', // Ini yang penting (Foreign Key)
  amount: 0,
  status: 'Pending',
  due_date: ''
});

// --- FETCH DATA (READ) ---
const fetchInvoices = async () => {
  isLoading.value = true;
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      id, amount, status, due_date,
      customers ( name, email )
    `)
    .order('id', { ascending: false });

  if (error) console.error(error);
  else invoices.value = data;
  
  isLoading.value = false;
};

// --- FETCH CUSTOMER LIST (Untuk Dropdown) ---
const fetchCustomerOptions = async () => {
  // Kita cuma butuh ID dan Nama untuk dropdown
  const { data } = await supabase.from('customers').select('id, name');
  if (data) customerOptions.value = data;
};

// --- CREATE INVOICE LOGIC ---
const openCreateModal = () => {
  // Reset Form
  formData.value = { customer_id: '', amount: 0, status: 'Pending', due_date: '' };
  // Ambil daftar customer terbaru buat dropdown
  fetchCustomerOptions();
  isModalOpen.value = true;
};

const handleSaveInvoice = async () => {
  if (!formData.value.customer_id || !formData.value.amount || !formData.value.due_date) {
    addToast('Please fill all fields', 'error');
    return;
  }

  isSubmitting.value = true;

  // Insert ke Supabase
  const { error } = await supabase.from('invoices').insert({
    customer_id: formData.value.customer_id, // ID Customer yang dipilih
    amount: formData.value.amount,
    status: formData.value.status,
    due_date: formData.value.due_date
  });

  isSubmitting.value = false;

  if (error) {
    addToast(error.message, 'error');
  } else {
    addToast('Invoice created successfully', 'success');
    isModalOpen.value = false;
    fetchInvoices(); // Refresh tabel
  }
};

// --- HELPERS ---
onMounted(() => {
  fetchInvoices();
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
};

const getStatusColor = (status) => {
  if (status === 'Paid') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (status === 'Pending') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Invoices</h1>
        <p class="text-slate-500 dark:text-slate-400">Financial records and transactions.</p>
      </div>
      <div class="flex gap-2">
        <AppButton variant="secondary">
          <template #icon><Download :size="16" /></template>
          Export
        </AppButton>
        <AppButton variant="primary" @click="openCreateModal">
          <template #icon><Plus :size="16" /></template>
          Create Invoice
        </AppButton>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
            <th class="px-6 py-4">Invoice ID</th>
            <th class="px-6 py-4">Customer</th>
            <th class="px-6 py-4">Amount</th>
            <th class="px-6 py-4">Status</th>
            <th class="px-6 py-4">Due Date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr v-for="inv in invoices" :key="inv.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <td class="px-6 py-4 font-mono text-xs text-slate-500">#INV-{{ inv.id }}</td>
            <td class="px-6 py-4">
              <p class="font-medium text-slate-900 dark:text-white">
                {{ inv.customers?.name || 'Unknown' }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ inv.customers?.email }}</p>
            </td>
            <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">
              {{ formatCurrency(inv.amount) }}
            </td>
            <td class="px-6 py-4">
              <span :class="`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inv.status)}`">
                {{ inv.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
              {{ inv.due_date }}
            </td>
          </tr>
          <tr v-if="invoices.length === 0 && !isLoading">
            <td colspan="5" class="px-6 py-8 text-center text-slate-500">No invoices found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppModal
      :isOpen="isModalOpen"
      title="Create New Invoice"
      @close="isModalOpen = false"
      @confirm="handleSaveInvoice"
    >
      <div class="space-y-4">
        
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Customer</label>
          <select 
            v-model="formData.customer_id"
            class="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>-- Choose Customer --</option>
            <option v-for="cust in customerOptions" :key="cust.id" :value="cust.id">
              {{ cust.name }}
            </option>
          </select>
        </div>

        <AppInput 
          v-model="formData.amount" 
          type="number" 
          label="Amount (IDR)" 
          placeholder="e.g. 500000" 
        />

        <div class="grid grid-cols-2 gap-4">
          <AppInput 
            v-model="formData.due_date" 
            type="date" 
            label="Due Date" 
          />
          
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
            <select 
              v-model="formData.status"
              class="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

      </div>

      <p v-if="isSubmitting" class="text-xs text-blue-600 mt-2 text-right animate-pulse">
        Creating invoice...
      </p>
    </AppModal>
  </div>
</template>