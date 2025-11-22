<script setup lang="ts">
import { ref } from 'vue';
import { Plus, Trash2, Edit2, Check, X, ListTodo } from 'lucide-vue-next';

// --- 1. TYPE DEFINITION ---
interface Task {
  id: number;
  text: string;
  completed: boolean;
}

// --- 2. STATE MANAGEMENT ---
const tasks = ref<Task[]>([
  { id: 1, text: 'Review Pull Request #42', completed: false },
  { id: 2, text: 'Update dokumentasi API', completed: true },
]);

const inputValue = ref('');
const editingId = ref<number | null>(null); // State kunci untuk mode Edit

// --- 3. LOGIC (CRUD) ---

// Fungsi Gabungan: Create & Update
const handleSubmit = () => {
  if (!inputValue.value.trim()) return;

  if (editingId.value) {
    // === UPDATE LOGIC ===
    const taskIndex = tasks.value.findIndex(t => t.id === editingId.value);
    if (taskIndex !== -1) {
      tasks.value[taskIndex].text = inputValue.value;
    }
    cancelEdit(); // Keluar mode edit
  } else {
    // === CREATE LOGIC ===
    tasks.value.unshift({
      id: Date.now(),
      text: inputValue.value,
      completed: false
    });
    inputValue.value = '';
  }
};

// Masuk ke Mode Edit
const startEdit = (task: Task) => {
  editingId.value = task.id;
  inputValue.value = task.text;
  // Opsional: Auto focus logic bisa ditambahkan di sini
};

// Batal Edit
const cancelEdit = () => {
  editingId.value = null;
  inputValue.value = '';
};

// Hapus Task
const deleteTask = (id: number) => {
  tasks.value = tasks.value.filter(t => t.id !== id);
  if (editingId.value === id) cancelEdit();
};

// Toggle Selesai
const toggleComplete = (task: Task) => {
  task.completed = !task.completed;
};
</script>

<template>
  <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-full flex flex-col">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <ListTodo :size="20" class="text-blue-600 dark:text-blue-400"/> 
        Quick Tasks
      </h3>
      <span class="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
        {{ tasks.filter(t => !t.completed).length }} Pending
      </span>
    </div>

    <form @submit.prevent="handleSubmit" class="flex gap-2 mb-6">
      <div class="relative flex-1">
        <input 
          v-model="inputValue"
          type="text"
          :placeholder="editingId ? 'Update task ini...' : 'Tulis task baru...'"
          class="w-full pl-4 pr-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition-all"
          :class="editingId 
            ? 'border-amber-400 focus:ring-amber-400 ring-amber-100 bg-amber-50 dark:bg-amber-900/10' 
            : 'border-slate-200 dark:border-slate-600 focus:ring-blue-500'"
        />
      </div>
      
      <button 
        type="submit"
        class="p-2 rounded-lg text-white transition-colors shadow-sm flex-shrink-0 w-10 flex items-center justify-center"
        :class="editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'"
        :title="editingId ? 'Update Task' : 'Add Task'"
      >
        <component :is="editingId ? Check : Plus" :size="20" />
      </button>
      
      <button 
        v-if="editingId" 
        @click="cancelEdit"
        type="button"
        class="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-red-500 transition-colors flex-shrink-0 w-10 flex items-center justify-center"
        title="Cancel Edit"
      >
        <X :size="20" />
      </button>
    </form>

    <div class="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
      <TransitionGroup name="list">
        <div 
          v-for="task in tasks" 
          :key="task.id"
          class="group flex items-center justify-between p-3 rounded-lg border transition-all duration-200"
          :class="editingId === task.id 
            ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700' 
            : 'bg-white dark:bg-slate-800 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-100 dark:hover:border-slate-600'"
        >
          <div class="flex items-center gap-3 overflow-hidden">
            <button 
              @click="toggleComplete(task)"
              class="w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0"
              :class="task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-500 hover:border-blue-500'"
            >
              <Check v-if="task.completed" :size="12" stroke-width="3" />
            </button>
            <span 
              class="text-sm truncate transition-all select-none cursor-pointer"
              @click="toggleComplete(task)"
              :class="task.completed ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700 dark:text-slate-200'"
            >
              {{ task.text }}
            </span>
          </div>

          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button 
              @click="startEdit(task)"
              :disabled="task.completed"
              class="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Edit"
            >
              <Edit2 :size="14" />
            </button>
            <button 
              @click="deleteTask(task.id)"
              class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              title="Delete"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
      </TransitionGroup>
      
      <div v-if="tasks.length === 0" class="text-center py-8 text-slate-400 text-xs italic">
        No tasks yet. Time to relax! 🌴
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>