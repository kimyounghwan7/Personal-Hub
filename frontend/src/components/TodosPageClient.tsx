"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Clock, Plus, Trash2 } from 'lucide-react';
import CalendarView from '@/components/CalendarView';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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

  const handleAddTodo = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await api.post<Todo>('/todos/', {
        title: newTodo.trim(),
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

  const handleToggleTodo = async (todo: Todo) => {
    const nextStatus = todo.status === 'completed' ? 'pending' : 'completed';

    try {
      const response = await api.put<Todo>(`/todos/${todo.id}`, {
        status: nextStatus,
      });

      if (response.data) {
        setTodos((currentTodos) =>
          currentTodos.map((item) => (item.id === todo.id ? response.data : item)),
        );
      }
    } catch (error) {
      console.error('Failed to update todo status:', error);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      await api.delete(`/todos/${todoId}`);
      setTodos((currentTodos) => currentTodos.filter((item) => item.id !== todoId));
    } catch (error) {
      console.error('Failed to delete todo:', error);
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
        <Card className="text-center max-w-md w-full p-4">
          <CardHeader className="items-center">
            <AlertTriangle className="h-12 w-12 text-amber-400 mb-2" />
            <CardTitle>{errorState.title}</CardTitle>
            <CardDescription className="pt-2">{errorState.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                void loadTodos();
              }}
              size="lg"
              className="w-full"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authState === 'pending_approval') {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="text-center max-w-md w-full p-4">
          <CardHeader className="items-center">
            <Clock className="h-12 w-12 text-amber-400 mb-2" />
            <CardTitle>Approval Pending</CardTitle>
            <CardDescription className="pt-2">
              Your account is registered, but an administrator still needs to approve it before you can use the calendar.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Badge variant="warning" className="py-2 px-4 text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Waiting for admin approval…
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedCount = todos.filter((todo) => todo.status === 'completed').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-24 max-w-6xl mx-auto px-4">
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              My To-Do List
            </CardTitle>
            <CardDescription className="mt-1">
              Manage your daily tasks and synchronize deadlines with your calendar.
            </CardDescription>
          </div>
          <Badge variant="outline">
            {completedCount} / {todos.length} Done
          </Badge>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleAddTodo} className="mb-6 flex gap-2.5">
            <Input
              type="text"
              value={newTodo}
              onChange={(event) => setNewTodo(event.target.value)}
              maxLength={200}
              placeholder="Add a new task..."
              className="flex-1"
            />
            <Button type="submit" className="h-11 px-6">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </form>

          {todos.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No tasks yet. Add one above!</p>
          ) : (
            <ul className="space-y-3">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-3.5">
                    <Checkbox
                      checked={todo.status === 'completed'}
                      onCheckedChange={() => {
                        void handleToggleTodo(todo);
                      }}
                      aria-label={`Mark ${todo.title} as ${todo.status === 'completed' ? 'pending' : 'completed'}`}
                    />
                    <span className={todo.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-200 font-medium'}>
                      {todo.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {todo.due_date && (
                      <Badge variant="outline" className="text-gray-400 font-normal">
                        {new Date(todo.due_date).toLocaleDateString()}
                      </Badge>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        void handleDeleteTodo(todo.id);
                      }}
                      aria-label={`Delete ${todo.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="md:col-span-1">
        <CalendarView todos={todos} />
      </div>
    </div>
  );
}
