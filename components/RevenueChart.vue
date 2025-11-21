<script setup lang="ts">
// Data konfigurasi chart
const chartOptions = {
  chart: {
    id: 'revenue-chart',
    type: 'area',
    fontFamily: 'inherit',
    toolbar: { show: false }, // Hilangkan menu toolbar biar bersih
    zoom: { enabled: false }
  },
  colors: ['#2563eb', '#10b981'], // Warna Blue & Emerald sesuai tema
  dataLabels: { enabled: false },
  stroke: {
    curve: 'smooth', // Garis melengkung halus
    width: 2
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 100]
    }
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: { colors: '#64748b', fontSize: '12px' }
    }
  },
  yaxis: {
    labels: {
      style: { colors: '#64748b', fontSize: '12px' },
      formatter: (value: number) => { return `$${value}k` } // Format uang
    }
  },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4, // Garis putus-putus untuk grid
    yaxis: { lines: { show: true } }
  },
  tooltip: {
    theme: 'light'
  }
};

// Data dummy series
const series = [
  {
    name: 'Revenue',
    data: [31, 40, 28, 51, 42, 109, 100, 95, 120]
  },
  {
    name: 'Expenses',
    data: [11, 32, 45, 32, 34, 52, 41, 20, 35]
  }
];
</script>

<template>
  <div class="w-full h-full">
    <ClientOnly>
      <apexchart 
        type="area" 
        height="300" 
        :options="chartOptions" 
        :series="series" 
      />
    </ClientOnly>
  </div>
</template>