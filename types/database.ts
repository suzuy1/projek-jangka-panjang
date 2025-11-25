export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// 1. Definisi Row Data
export interface Customer {
  id: number
  name: string
  email: string
  role: string
  status: 'Active' | 'Inactive'
  created_at?: string
}

// 2. Definisi Database Interface (Standar Supabase)
export interface Database {
  public: {
    Tables: {
      customers: {
        Row: Customer
        Insert: Omit<Customer, 'id' | 'created_at'> // ID & created_at digenerate server
        Update: Partial<Omit<Customer, 'id' | 'created_at'>>
        Relationships: []
      }
      // Tambahkan tabel lain di sini jika perlu (invoices, dll)
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}