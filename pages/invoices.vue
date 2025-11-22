<script setup lang="ts">
import { FileText, Plus, Search, Download, Save, Edit2, Trash2, Loader2, AlertTriangle } from 'lucide-vue-next';

const supabase = useSupabaseClient();
const { addToast } = useToast();

// --- STATE ---
const invoices = ref([]);
const customerOptions = ref([]); 
const isLoading = ref(true);
const isModalOpen = ref(false);
const isSubmitting = ref(false);

// State untuk Mode Edit & Delete
const formMode = ref<'create' | 'edit'>('create');
const editingId = ref<number | null>(null);
const isDeleteModalOpen = ref(false);
const deleteId = ref<number | null>(null);

// Form Data
const formData = ref({
  customer_id: '',
  amount: 0,
  status: 'Pending',
  due_date: ''
});

// --- FETCH DATA (READ) ---
const fetchInvoices = async () => {
  isLoading.value = true;
  // PENTING: Kita perlu 'customer_id' untuk mengisi dropdown saat edit
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      id, amount, status, due_date, customer_id,
      customers ( id, name, email )
    `)
    .order('id', { ascending: false });

  if (error) console.error(error);
  else invoices.value = data;
  
  isLoading.value = false;
};

const fetchCustomerOptions = async () => {
  const { data } = await supabase.from('customers').select('id, name');
  if (data) customerOptions.value = data;
};

// --- MODAL HANDLERS ---

// 1. Buka Modal CREATE
const openCreateModal = () => {
  formMode.value = 'create';
  editingId.value = null;
  formData.value = { customer_id: '', amount: 0, status: 'Pending', due_date: '' };
  fetchCustomerOptions();
  isModalOpen.value = true;
};

// 2. Buka Modal EDIT
const openEditModal = (invoice: any) => {
  formMode.value = 'edit';
  editingId.value = invoice.id;
  
  // Isi form dengan data yang mau diedit
  formData.value = {
    customer_id: invoice.customer_id, // Pastikan query select mengambil field ini
    amount: invoice.amount,
    status: invoice.status,
    due_date: invoice.due_date
  };
  
  fetchCustomerOptions();
  isModalOpen.value = true;
};

// --- SAVE LOGIC (CREATE & UPDATE) ---
const handleSaveInvoice = async () => {
  if (!formData.value.customer_id || !formData.value.amount || !formData.value.due_date) {
    addToast('Please fill all fields', 'error');
    return;
  }

  isSubmitting.value = true;

  try {
    if (formMode.value === 'create') {
      // === LOGIC CREATE ===
      const { error } = await supabase.from('invoices').insert({
        customer_id: formData.value.customer_id,
        amount: formData.value.amount,
        status: formData.value.status,
        due_date: formData.value.due_date
      });
      if (error) throw error;
      addToast('Invoice created successfully', 'success');

    } else {
      // === LOGIC UPDATE ===
      const { error } = await supabase
        .from('invoices')
        .update({
          customer_id: formData.value.customer_id,
          amount: formData.value.amount,
          status: formData.value.status,
          due_date: formData.value.due_date
        })
        .eq('id', editingId.value); // Update berdasarkan ID
      
      if (error) throw error;
      addToast('Invoice updated successfully', 'success');
    }

    isModalOpen.value = false;
    fetchInvoices(); // Refresh data

  } catch (error: any) {
    addToast(error.message, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

// --- DELETE LOGIC ---
const openDeleteModal = (id: number) => {
  deleteId.value = id;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteId.value) return;
  
  const { error } = await supabase.from('invoices').delete().eq('id', deleteId.value);
  
  if (error) {
    addToast('Failed to delete: ' + error.message, 'error');
  } else {
    addToast('Invoice deleted', 'success');
    fetchInvoices();
  }
  isDeleteModalOpen.value = false;
};

// --- HELPERS ---
onMounted(() => {
  fetchInvoices();
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
};

const getStatusColor = (status: string) => {
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
      <div v-if="isLoading" class="flex justify-center py-12">
        <Loader2 class="animate-spin text-blue-600" :size="32" />
      </div>
      
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
            <th class="px-6 py-4">Invoice ID</th>
            <th class="px-6 py-4">Customer</th>
            <th class="px-6 py-4">Amount</th>
            <th class="px-6 py-4">Status</th>
            <th class="px-6 py-4">Due Date</th>
            <th class="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr v-for="inv in invoices" :key="inv.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
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
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  @click="openEditModal(inv)"
                  class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 :size="16" />
                </button>
                <button 
                  @click="openDeleteModal(inv.id)"
                  class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="invoices.length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-slate-500">No invoices found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppModal
      :isOpen="isModalOpen"
      :title="formMode === 'create' ? 'Create New Invoice' : 'Edit Invoice'"
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
        Saving invoice...
      </p>
    </AppModal>

    <AppModal
      :isOpen="isDeleteModalOpen"
      title="Delete Invoice"
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
           <p class="text-sm text-slate-500 dark:text-slate-400">
             Are you sure you want to delete this invoice? This action cannot be undone.
           </p>
         </div>
       </div>
    </AppModal>

  </div>
</template>