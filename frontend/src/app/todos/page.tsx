"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CalendarView from '@/components/CalendarView';
import api from '@/lib/api';
import { supabase } from '@/lib/supabase';

type Todo = {
  id: string;
  title: string;
  description: string;
  status: string;
  due_date: string;
  priority: number;
};

export default function TodosPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<'checking' | 'unauthenticated' | 'pending_approval' | 'approved'>('checking');

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setAuthState('unauthenticated');
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/todos/');
      setTodos(res.data || []);
      setAuthState('approved');
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.detail === 'Waiting for admin approval') {
        setAuthState('pending_approval');
      } else if (err.response?.status === 401) {
        setAuthState('unauthenticated');
      } else {
        console.error('Failed to fetch todos:', err);
        setAuthState('approved');
      }
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
        due_date: new Date().toISOString()
      });
      if (res.data) {
        setTodos([...todos, res.data]);
        setNewTodo('');
      }
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  // --- Not Logged In ---
  if (authState === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/10 text-center max-w-md w-full">
          <div className="text-5xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-3">Login Required</h2>
          <p className="text-gray-400 mb-8">To access your Calendar and Todo list, please sign in first.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-500 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // --- Pending Admin Approval ---
  if (authState === 'pending_approval') {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/10 text-center max-w-md w-full">
          <div className="text-5xl mb-6">⏳</div>
          <h2 className="text-2xl font-bold text-white mb-3">Approval Pending</h2>
          <p className="text-gray-400 mb-4">Your account has been registered, but an administrator needs to approve it before you can use the service.</p>
          <div className="flex items-center justify-center gap-2 text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg py-3 px-4">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse"></span>
            <span className="font-medium text-sm">Waiting for admin approval...</span>
          </div>
        </div>
      </div>
    );
  }

  // --- Approved: Full Todo + Calendar View ---
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-24 max-w-6xl mx-auto px-4">
      <div className="md:col-span-2 bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/10 text-white">
        <h1 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">My To-Do List</h1>
        
        <form onSubmit={handleAddTodo} className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
          />
          <button 
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all font-semibold shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            Add
          </button>
        </form>

        {todos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tasks yet. Add one above! ✨</p>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li key={todo.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={todo.status === 'completed'}
                    readOnly
                    className="w-5 h-5 cursor-pointer accent-blue-500 rounded" 
                  />
                  <span className={todo.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-200'}>
                    {todo.title}
                  </span>
                </div>
                {todo.due_date && (
                  <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
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
