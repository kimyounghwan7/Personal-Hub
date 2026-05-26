"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CalendarView from '@/components/CalendarView';
import api, { getApiErrorDetail, isNetworkError, isPendingApprovalError, isServerError, isUnauthorizedError } from '@/lib/api';
import { buildLoginPath } from '@/lib/auth-paths';

type Todo = {
  id: string;
  title: string;
  description: string;
  status: string;
  due_date: string;
  priority: number;
};

type ErrorState = {
  title: string;
  description: string;
};

const DEFAULT_ERROR_STATE: ErrorState = {
  title: 'Unable to load your calendar',
  description: 'We could not load your tasks right now. Please try again.',
};

export default function TodosPageClient() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<'ready' | 'pending_approval' | 'error'>('ready');
  const [errorState, setErrorState] = useState<ErrorState>(DEFAULT_ERROR_STATE);

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setAuthState('ready');
    setErrorState(DEFAULT_ERROR_STATE);

    try {
      const response = await api.get<Todo[]>('/todos/');
      setTodos(response.data || []);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        router.replace(buildLoginPath('/todos'));
        router.refresh();
        return;
      }

      if (isPendingApprovalError(error)) {
        setAuthState('pending_approval');
        return;
      }

      const detail = getApiErrorDetail(error);
      const nextErrorState = isNetworkError(error)
        ? {
            title: 'Backend connection issue',
            description: 'The calendar service is unreachable right now. Check the API connection and try again.',
          }
        : isServerError(error)
          ? {
              title: 'Calendar service error',
              description: 'The backend returned an unexpected error while loading your tasks. Please retry shortly.',
            }
          : {
              title: 'Unable to load your calendar',
              description: detail ?? DEFAULT_ERROR_STATE.description,
            };

      console.error('Failed to fetch todos:', error);
      setAuthState('error');
      setErrorState(nextErrorState);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadTodos();
  }, [loadTodos]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await api.post<Todo>('/todos/', {
        title: newTodo,
        due_date: new Date().toISOString(),
      });

      if (response.data) {
        setTodos((currentTodos) => [...currentTodos, response.data]);
        setNewTodo('');
      }
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-gray-400 text-lg">Loading your calendar…</div>
      </div>
    );
  }

  if (authState === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/10 text-center max-w-md w-full">
          <div className="text-5xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-3">{errorState.title}</h2>
          <p className="text-gray-400 mb-8">{errorState.description}</p>
          <button
            onClick={() => {
              void loadTodos();
            }}
            className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-500 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (authState === 'pending_approval') {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/10 text-center max-w-md w-full">
          <div className="text-5xl mb-6">⏳</div>
          <h2 className="text-2xl font-bold text-white mb-3">Approval Pending</h2>
          <p className="text-gray-400 mb-4">Your account is registered, but an administrator still needs to approve it before you can use the calendar.</p>
          <div className="flex items-center justify-center gap-2 text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg py-3 px-4">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse"></span>
            <span className="font-medium text-sm">Waiting for admin approval…</span>
          </div>
        </div>
      </div>
    );
  }

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
