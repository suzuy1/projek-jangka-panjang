<script setup lang="ts">
import { Calendar, ChevronDown, ArrowUpRight, ArrowDownRight, Globe, Smartphone, Monitor } from 'lucide-vue-next';

// --- 1. KONFIGURASI BAR CHART (Traffic Sources) ---
const visitorChartOptions = {
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'inherit'
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '45%',
      distributed: true, // Agar tiap bar bisa beda warna jika mau
    }
  },
  dataLabels: { enabled: false },
  legend: { show: false },
  xaxis: {
    categories: ['Direct', 'Social', 'Organic', 'Referral', 'Email', 'Ads'],
    labels: { style: { colors: '#94a3b8', fontSize: '12px' } },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: { style: { colors: '#94a3b8', fontSize: '12px' } }
  },
  grid: {
    borderColor: '#f1f5f9', // Warna grid tipis
    strokeDashArray: 4,
    yaxis: { lines: { show: true } } 
  },
  colors: ['#3b82f6'], // Blue-500
  tooltip: { theme: 'light' }
};

const visitorSeries = [{
  name: 'Visitors',
  data: [4500, 3200, 6100, 1200, 800, 2100]
}];

// --- 2. KONFIGURASI DONUT CHART (Devices) ---
const deviceChartOptions = {
  chart: {
    type: 'donut',
    fontFamily: 'inherit'
  },
  labels: ['Desktop', 'Mobile', 'Tablet'],
  colors: ['#3b82f6', '#10b981', '#8b5cf6'], // Blue, Emerald, Violet
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          name: { show: true, color: '#94a3b8' },
          value: { 
            show: true, 
            fontSize: '24px', 
            fontWeight: 600, 
            color: '#475569',
            formatter: function (val:string) { return val + "%" } 
          },
          total: {
            show: true,
            label: 'Mobile',
            color: '#94a3b8',
            formatter: function () { return '45%' } // Dummy logic
          }
        }
      }
    }
  },
  dataLabels: { enabled: false },
  legend: { position: 'bottom', fontFamily: 'inherit', itemMargin: { horizontal: 10, vertical: 5 } },
  stroke: { show: false }, // Hilangkan border putih antar slice
  tooltip: { theme: 'light' }
};

const deviceSeries = [55, 35, 10]; // Persentase

// --- 3. METRICS DATA ---
const metrics = [
  { title: 'Bounce Rate', value: '42.3%', change: '-2.1%', isGood: true },
  { title: 'Avg. Session', value: '4m 12s', change: '+12%', isGood: true },
  { title: 'New Sessions', value: '68.2%', change: '-4.5%', isGood: false },
];
</script>

<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Analytics Report</h1>
        <p class="text-slate-500 dark:text-slate-400">Performance metrics from Oct 24 - Nov 24, 2025</p>
      </div>
      
      <button class="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
        <Calendar :size="16" class="text-slate-500" />
        <span>Last 30 Days</span>
        <ChevronDown :size="16" class="text-slate-400 ml-2" />
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div v-for="(m, i) in metrics" :key="i" class="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{{ m.title }}</p>
        <div class="flex items-end gap-2">
          <span class="text-2xl font-bold text-slate-900 dark:text-white">{{ m.value }}</span>
          <span :class="`flex items-center text-xs font-medium mb-1 ${m.isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`">
            <ArrowUpRight v-if="m.isGood" :size="14" />
            <ArrowDownRight v-else :size="14" />
            {{ m.change }}
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div class="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Traffic Sources</h3>
          <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400">
            <Globe :size="20" />
          </button>
        </div>
        <div class="h-[300px]">
          <ClientOnly>
            <apexchart type="bar" height="100%" :options="visitorChartOptions" :series="visitorSeries" />
          </ClientOnly>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Device Usage</h3>
          <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400">
            <Smartphone :size="20" />
          </button>
        </div>
        <div class="h-[300px] flex items-center justify-center">
           <ClientOnly>
            <apexchart type="donut" width="100%" :options="deviceChartOptions" :series="deviceSeries" />
           </ClientOnly>
        </div>
        <div class="mt-4 flex justify-center gap-6 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
            <span class="text-slate-600 dark:text-slate-300">Desktop</span>
          </div>
          <div class="flex items-center gap-2">
             <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span class="text-slate-600 dark:text-slate-300">Mobile</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>