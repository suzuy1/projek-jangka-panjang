<script setup lang="ts">
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-vue-next';

interface Stat {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: any;
  color: string; // Tetap berwarna agar kontras
}

interface Transaction {
  id: string;
  user: string;
  date: string;
  amount: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

const stats: Stat[] = [
  { title: 'Total Revenue', value: '$45,231.89', trend: '+20.1% from last month', isPositive: true, icon: DollarSign, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { title: 'Active Users', value: '+2,350', trend: '+180.1% from last month', isPositive: true, icon: Users, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' },
  { title: 'Sales', value: '+12,234', trend: '+19% from last month', isPositive: true, icon: TrendingUp, color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400' },
  { title: 'Active Now', value: '+573', trend: '-20 since last hour', isPositive: false, icon: Activity, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400' },
];

const recentTransactions: Transaction[] = [
  { id: '#TRX-9871', user: 'Budi Santoso', date: '2024-11-21', amount: '$450.00', status: 'Completed' },
  { id: '#TRX-9872', user: 'Siti Aminah', date: '2024-11-21', amount: '$120.50', status: 'Pending' },
  { id: '#TRX-9873', user: 'John Doe', date: '2024-11-20', amount: '$1,200.00', status: 'Failed' },
  { id: '#TRX-9874', user: 'Sarah Smith', date: '2024-11-20', amount: '$850.00', status: 'Completed' },
];

const getStatusColor = (status: string) => {
  switch(status) {
    case 'Completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'Failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  }
};
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
      <p class="text-slate-500 dark:text-slate-400">Welcome back, here's what's happening with your projects today.</p>
    </div>

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
          <span :class="`text-xs mt-1 ${stat.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`">
            {{ stat.trend }}
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div class="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Revenue Overview</h3>
          <button class="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">View Report</button>
        </div>
        
        <div class="h-[320px] w-full">
           <RevenueChart />
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Transactions</h3>
        <div class="space-y-4">
          <div v-for="trx in recentTransactions" :key="trx.id" class="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <div class="flex flex-col">
              <span class="text-sm font-medium text-slate-900 dark:text-white">{{ trx.user }}</span>
              <span class="text-xs text-slate-500 dark:text-slate-400">{{ trx.date }}</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-bold text-slate-900 dark:text-white">{{ trx.amount }}</div>
              <span :class="`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusColor(trx.status)}`">
                {{ trx.status }}
              </span>
            </div>
          </div>
        </div>
        <button class="w-full mt-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
          View All
        </button>
      </div>
    </div>
  </div>
</template>