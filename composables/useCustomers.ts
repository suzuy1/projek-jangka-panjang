import { ref } from 'vue';
import type { Customer, Database } from '~/types/database';
import { useSupabaseClient } from '#imports';


export const useCustomers = () => {
  const supabase = useSupabaseClient<Database>();

  const customers = ref<Customer[]>([]);
  const totalCount = ref(0);
  const isLoading = ref(false);

  const fetchCustomers = async (page: number, itemsPerPage: number, searchQuery: string) => {
    isLoading.value = true;
    try {
      let query = supabase.from('customers').select('*', { count: 'exact' });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await query.range(from, to).order('created_at', { ascending: false });

      if (error) throw error;

      customers.value = data || [];
      totalCount.value = count || 0;
    } catch (error: any) {
      console.error('Error fetching customers:', error.message);
    } finally {
      isLoading.value = false;
    }
  };

  const createCustomer = async (newCustomer: Omit<Customer, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('customers').insert(newCustomer as Database['public']['Tables']['customers']['Insert']).select().single();
    if (error) throw error;
    return data;
  };

  const updateCustomer = async (id: number, updatedFields: Partial<Omit<Customer, 'id' | 'created_at'>>) => {
    const { data, error } = await supabase.from('customers').update(updatedFields as Database['public']['Tables']['customers']['Update']).eq('id', id).select().single();
    if (error) throw error;
    return data;
  };

  const deleteCustomer = async (id: number) => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
  };

  return {
    customers,
    totalCount,
    isLoading,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};
