"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  ListTodo,
  Plus,
  Trash2,
} from 'lucide-react';
import CalendarView from '@/components/CalendarView';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import api, {
  getApiErrorDetail,
  isNetworkError,
  isPendingApprovalError,
  isServerError,
  isUnauthorizedError,
} from '@/lib/api';
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
  title: 'Unable to load your workspace',
  description: 'We could not load your tasks right now. Please try again.',
};

export default function TodosPageClient() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');
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
            description:
              'The calendar service is unreachable right now. Check the API connection and try again.',
          }
        : isServerError(error)
          ? {
              title: 'Calendar service error',
              description:
                'The backend returned an unexpected error while loading your tasks. Please retry shortly.',
            }
          : {
              title: 'Unable to load your workspace',
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
      <div className="flex items-center justify-center min-h-screen px-4 bg-subtle-grid">
        <Badge variant="outline" className="py-2 px-4 text-sm">
          <span className="h-2 w-2 rounded-full bg-[#8ee3be] animate-pulse" />
          Loading your workspace…
        </Badge>
      </div>
    );
  }

  if (authState === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-subtle-grid">
        <Card className="text-center max-w-md w-full p-4">
          <CardHeader className="items-center">
            <AlertTriangle className="h-12 w-12 text-amber-300 mb-2" />
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
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authState === 'pending_approval') {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-subtle-grid">
        <Card className="text-center max-w-md w-full p-4">
          <CardHeader className="items-center">
            <Clock className="h-12 w-12 text-amber-300 mb-2" />
            <CardTitle>Approval Pending</CardTitle>
            <CardDescription className="pt-2">
              Your account is registered, but an administrator still needs to approve it before you can access the workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Badge variant="warning" className="py-2 px-4 text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
              Waiting for admin approval…
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedCount = todos.filter((todo) => todo.status === 'completed').length;
  const pendingCount = todos.length - completedCount;
  const progressPercent = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  const visibleTodos = todos.filter((todo) => {
    if (filterMode === 'pending') return todo.status !== 'completed';
    if (filterMode === 'completed') return todo.status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen bg-subtle-grid pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-emerald-100/60">Total Tasks</div>
              <div className="text-2xl font-bold text-white mt-1">{todos.length}</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#8ee3be]/12 border border-[#8ee3be]/30 flex items-center justify-center text-[#8ee3be]">
              <ListTodo className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-emerald-100/60">In Progress</div>
              <div className="text-2xl font-bold text-[#a7f3d0] mt-1">{pendingCount}</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-teal-300/12 border border-teal-300/30 flex items-center justify-center text-teal-200">
              <CalendarDays className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-emerald-100/60">Completion Rate</div>
              <span className="text-sm font-bold text-[#8ee3be]">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden mt-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8ee3be] to-[#6ee7b7] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#d8f9e9] via-[#8ee3be] to-[#6ee7b7]">
                  Task Workspace
                </CardTitle>
                <CardDescription className="mt-1">
                  Organize daily priorities and track deadlines alongside your calendar.
                </CardDescription>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-emerald-200/10 self-start">
                {(['all', 'pending', 'completed'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFilterMode(mode)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      filterMode === mode
                        ? 'bg-[#8ee3be] text-[#062016]'
                        : 'text-emerald-100/65 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleAddTodo} className="mb-6 flex gap-2.5">
                <Input
                  type="text"
                  value={newTodo}
                  onChange={(event) => setNewTodo(event.target.value)}
                  maxLength={200}
                  placeholder="Add a new task (max 200 chars)…"
                  className="flex-1"
                />
                <Button type="submit" className="h-11 px-6">
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </form>

              {visibleTodos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-emerald-200/15 bg-white/[0.02] py-12 px-4 text-center">
                  <CheckCircle2 className="h-8 w-8 text-[#8ee3be]/60 mx-auto mb-2.5" />
                  <p className="text-sm text-emerald-100/60">
                    {todos.length === 0
                      ? 'No tasks yet. Create your first task above!'
                      : `No ${filterMode} tasks found.`}
                  </p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {visibleTodos.map((todo) => (
                    <li
                      key={todo.id}
                      className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-emerald-200/10 hover:border-[#8ee3be]/35 hover:bg-white/[0.05] transition-all group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <Checkbox
                          checked={todo.status === 'completed'}
                          onCheckedChange={() => {
                            void handleToggleTodo(todo);
                          }}
                          aria-label={`Mark ${todo.title} as ${todo.status === 'completed' ? 'pending' : 'completed'}`}
                        />
                        <span
                          className={
                            todo.status === 'completed'
                              ? 'line-through text-emerald-100/40 truncate'
                              : 'text-emerald-50 font-medium truncate'
                          }
                        >
                          {todo.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 ml-3">
                        {todo.due_date && (
                          <Badge variant="outline" className="font-normal">
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

          <div className="lg:col-span-1">
            <CalendarView todos={todos} />
          </div>
        </div>
      </div>
    </div>
  );
}
