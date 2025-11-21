// State global untuk menyimpan antrian toast
// Kita taruh di luar function agar state-nya shared (Global)
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const toasts = ref<Toast[]>([]);

export const useToast = () => {
  
  // Fungsi untuk menambah toast baru
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now(); // Generate ID unik pakai timestamp
    
    toasts.value.push({ id, message, type });

    // Otomatis hilang setelah 3 detik
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  // Fungsi menghapus toast
  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  };

  return {
    toasts,
    addToast,
    removeToast
  };
};