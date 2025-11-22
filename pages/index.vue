<script setup lang="ts">
import { TrendingUp, Users, DollarSign, FileClock, Loader2 } from 'lucide-vue-next';

const supabase = useSupabaseClient();

// --- STATE ---
const isLoading = ref(true);
const stats = ref([
  { 
    title: 'Total Revenue', 
    value: 'Rp 0', 
    desc: 'From paid invoices', 
    icon: DollarSign, 
    color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' 
  },
  { 
    title: 'Active Customers', 
    value: '0', 
    desc: 'Registered active users', 
    icon: Users, 
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' 
  },
  { 
    title: 'Pending Invoices', 
    value: '0', 
    desc: 'Unpaid invoices count', 
    icon: FileClock, 
    color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' 
  },
  { 
    title: 'Total Invoices', 
    value: '0', 
    desc: 'All time invoices', 
    icon: TrendingUp, 
    color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400' 
  },
]);

const recentInvoices = ref([]);

// --- FETCH DATA REAL DARI SUPABASE ---
const fetchDashboardData = async () => {
  isLoading.value = true;

  try {
    // 1. Hitung Total Revenue (Hanya yang status 'Paid')
    const { data: paidInvoices } = await supabase
      .from('invoices')
      .select('amount')
      .eq('status', 'Paid');
    
    const totalRevenue = paidInvoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
    stats.value[0].value = formatCurrency(totalRevenue);

    // 2. Hitung Active Customers
    const { count: customerCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active');
    stats.value[1].value = customerCount?.toString() || '0';

    // 3. Hitung Pending Invoices
    const { count: pendingCount } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Pending');
    stats.value[2].value = pendingCount?.toString() || '0';

    // 4. Hitung Total Invoices
    const { count: totalInvCount } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true });
    stats.value[3].value = totalInvCount?.toString() || '0';

    // 5. Ambil 5 Invoice Terbaru (Recent Transactions)
    const { data: recentData } = await supabase
      .from('invoices')
      .select(`
        id, amount, status, created_at,
        customers ( name )
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    recentInvoices.value = recentData || [];

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  } finally {
    isLoading.value = false;
  }
};

// Helper Format Rupiah
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

const getStatusColor = (status: string) => {
  if (status === 'Paid') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (status === 'Pending') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
      <p class="text-slate-500 dark:text-slate-400">Welcome back, here's what's happening with your projects today.</p>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <Loader2 class="animate-spin text-blue-600" :size="40" />
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="(stat, index) in stats" :key="index" class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ stat.title }}</h3>
            <div :class="`p-2 rounded-lg ${stat.color}`">
              <component :is="stat.icon" :size="20" />
            </div>
          </div>
          <div class="flex flex-col">
            <span class="text-2xl font-bold text-slate-900 dark:text-white">{{ stat.value }}</span>
            <span class="text-xs mt-1 text-slate-400">
              {{ stat.desc }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Revenue Analytics</h3>
            <NuxtLink to="/analytics" class="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">Full Report</NuxtLink>
          </div>
          
          <div class="h-[320px] w-full">
             <RevenueChart />
          </div>
        </div>

        <div class="lg:col-span-1 h-full">
           <TodoWidget />
        </div>

        <div class="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Recent Invoices</h3>
            <NuxtLink to="/invoices" class="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">View All</NuxtLink>
          </div>
          
          <div class="space-y-4">
            <div v-for="inv in recentInvoices" :key="inv.id" class="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0">
              <div class="flex flex-col">
                <span class="text-sm font-medium text-slate-900 dark:text-white">{{ inv.customers?.name || 'Unknown Customer' }}</span>
                <span class="text-xs text-slate-500 dark:text-slate-400">#INV-{{ inv.id }} &bull; {{ new Date(inv.created_at).toLocaleDateString() }}</span>
              </div>
              <div class="text-right">
                <div class="text-sm font-bold text-slate-900 dark:text-white">{{ formatCurrency(inv.amount) }}</div>
                <span :class="`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusColor(inv.status)}`">
                  {{ inv.status }}
                </span>
              </div>
            </div>
            
            <div v-if="recentInvoices.length === 0" class="text-center py-6 text-slate-500 text-sm">
              No recent invoices found.
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>