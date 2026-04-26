"use client";

import { useEffect, useState } from 'react';
import CalendarView from '@/components/CalendarView';
import api from '@/lib/api';

type Todo = {
  id: string;
  title: string;
  description: string;
  status: string;
  due_date: string;
  priority: number;
};

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd ensure the user is logged in first
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await api.get('/todos/');
      setTodos(res.data || []);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const res = await api.post('/todos/', {
        title: newTodo,
        due_date: new Date().toISOString() // Default to today for demo
      });
      if (res.data) {
        setTodos([...todos, res.data]);
        setNewTodo('');
      }
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold mb-6">My To-Do List</h1>
        
        <form onSubmit={handleAddTodo} className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
          <button 
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add
          </button>
        </form>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : todos.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tasks yet. Add one above!</p>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li key={todo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-5 h-5 cursor-pointer" />
                  <span className={todo.status === 'completed' ? 'line-through text-gray-400' : ''}>
                    {todo.title}
                  </span>
                </div>
                {todo.due_date && (
                  <span className="text-sm text-gray-500">
                    {new Date(todo.due_date).toLocaleDateString()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="md:col-span-1">
        <CalendarView todos={todos} />
      </div>
    </div>
  );
}
