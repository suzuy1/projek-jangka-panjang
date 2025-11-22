<script setup lang="ts">
import { Calendar, ChevronDown, ArrowUpRight, DollarSign, TrendingUp, Activity, Loader2 } from 'lucide-vue-next';

const supabase = useSupabaseClient();
const isLoading = ref(true);

// --- STATE CHART & METRICS ---
const metrics = ref([
  { title: 'Avg. Invoice Value', value: 'Rp 0', change: '+0%', isGood: true },
  { title: 'Conversion Rate', value: '0%', change: '0%', isGood: true },
  { title: 'Total Invoices', value: '0', change: '+0', isGood: true },
]);

// 1. Revenue Chart Config (Monthly)
const revenueChartOptions = ref({
  chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit', zoom: { enabled: false } },
  colors: ['#2563eb'], // Blue-600
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: [] as string[], // Bulan (Jan, Feb...)
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#94a3b8', fontSize: '12px' } }
  },
  yaxis: {
    labels: { 
      style: { colors: '#94a3b8', fontSize: '12px' },
      formatter: (val: number) => `Rp ${(val / 1000).toFixed(0)}k` // Format ribuan (k)
    } 
  },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
  tooltip: { theme: 'light', y: { formatter: (val: number) => formatCurrency(val) } }
});

const revenueSeries = ref([{ name: 'Revenue', data: [] as number[] }]);

// 2. Invoice Status Chart Config (Donut)
const statusChartOptions = ref({
  chart: { type: 'donut', fontFamily: 'inherit' },
  labels: ['Paid', 'Pending', 'Overdue'],
  colors: ['#10b981', '#f59e0b', '#ef4444'], // Emerald, Amber, Red
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          name: { show: true, color: '#94a3b8' },
          value: { show: true, fontSize: '20px', fontWeight: 600, color: '#334155' },
          total: { show: true, label: 'Total', color: '#94a3b8' }
        }
      }
    }
  },
  dataLabels: { enabled: false },
  legend: { position: 'bottom', fontFamily: 'inherit' },
  stroke: { show: false },
  tooltip: { theme: 'light' }
});

const statusSeries = ref([0, 0, 0]); // Paid, Pending, Overdue count

// --- DATA FETCHING ---
const fetchData = async () => {
  isLoading.value = true;
  try {
    // Ambil semua invoice untuk diolah
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('amount, status, created_at, due_date')
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (invoices && invoices.length > 0) {
      processRevenueChart(invoices);
      processStatusChart(invoices);
      processMetrics(invoices);
    }
  } catch (err) {
    console.error('Failed to fetch analytics:', err);
  } finally {
    isLoading.value = false;
  }
};

// --- DATA PROCESSING LOGIC ---

// 1. Proses Data untuk Grafik Pendapatan Bulanan
const processRevenueChart = (data: any[]) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyRevenue = new Array(12).fill(0);

  data.forEach(inv => {
    if (inv.status === 'Paid') {
      const date = new Date(inv.created_at);
      const monthIndex = date.getMonth(); // 0 - 11
      monthlyRevenue[monthIndex] += inv.amount;
    }
  });

  // Update Chart State
  // Tips: Di real app, Anda mungkin ingin memfilter tahun saat ini saja
  revenueChartOptions.value = {
    ...revenueChartOptions.value,
    xaxis: { ...revenueChartOptions.value.xaxis, categories: months }
  };
  revenueSeries.value = [{ name: 'Revenue', data: monthlyRevenue }];
};

// 2. Proses Data untuk Donut Chart (Status)
const processStatusChart = (data: any[]) => {
  const paid = data.filter(i => i.status === 'Paid').length;
  const pending = data.filter(i => i.status === 'Pending').length;
  const overdue = data.filter(i => i.status === 'Overdue').length; // Asumsi ada status 'Overdue' atau logika tanggal

  statusSeries.value = [paid, pending, overdue];
};

// 3. Hitung Metrics Sederhana
const processMetrics = (data: any[]) => {
  const totalVal = data.reduce((sum, i) => sum + i.amount, 0);
  const avgVal = totalVal / data.length;
  
  const paidCount = data.filter(i => i.status === 'Paid').length;
  const conversion = (paidCount / data.length) * 100;

  metrics.value[0].value = formatCurrency(avgVal); // Avg Invoice
  metrics.value[1].value = `${conversion.toFixed(1)}%`; // Paid Rate
  metrics.value[2].value = data.length.toString(); // Total Invoices
};

// Helper
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Financial Analytics</h1>
        <p class="text-slate-500 dark:text-slate-400">Real-time financial performance reports.</p>
      </div>
      
      <button class="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
        <Calendar :size="16" class="text-slate-500" />
        <span>This Year</span>
        <ChevronDown :size="16" class="text-slate-400 ml-2" />
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <Loader2 class="animate-spin text-blue-600" :size="40" />
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div v-for="(m, i) in metrics" :key="i" class="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{{ m.title }}</p>
          <div class="flex items-end gap-2">
            <span class="text-2xl font-bold text-slate-900 dark:text-white">{{ m.value }}</span>
            <span v-if="m.change" class="flex items-center text-xs font-medium mb-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUpRight :size="12" class="mr-1"/> {{ m.change }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Monthly Revenue</h3>
            <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <DollarSign :size="20" />
            </div>
          </div>
          <div class="h-[300px]">
            <ClientOnly>
              <apexchart type="area" height="100%" :options="revenueChartOptions" :series="revenueSeries" />
            </ClientOnly>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Invoice Status</h3>
            <div class="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg text-violet-600 dark:text-violet-400">
              <Activity :size="20" />
            </div>
          </div>
          <div class="h-[300px] flex items-center justify-center">
             <ClientOnly>
              <apexchart type="donut" width="100%" :options="statusChartOptions" :series="statusSeries" />
             </ClientOnly>
          </div>
          <div class="mt-4 flex justify-center gap-4 text-xs text-slate-500">
            <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-emerald-500"></div> Paid</div>
            <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-amber-500"></div> Pending</div>
            <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-red-500"></div> Overdue</div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>