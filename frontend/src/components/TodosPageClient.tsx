"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  CalendarDays,
  CheckCircle2,
  Clock,
  LayoutList,
  ListTodo,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import MonthCalendarGrid from '@/components/todos/MonthCalendarGrid';
import ScheduleMiniStrip from '@/components/todos/ScheduleMiniStrip';
import UndatedBacklogRail from '@/components/todos/UndatedBacklogRail';
import {
  buildSamplePreviewTodos,
  extractIsoDatePart,
  formatIsoDate,
  isTodoOverdue,
} from '@/components/todos/calendar-math';
import {
  CalendarMode,
  StatusFilterMode,
  TodoCategoryTag,
  TodoItem,
  WorkspaceViewMode,
} from '@/components/todos/types';
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
  const todayDate = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => formatIsoDate(todayDate), [todayDate]);

  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoStartDate, setNewTodoStartDate] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState(todayIso);
  const [newTodoPriority, setNewTodoPriority] = useState<number>(2);
  const [newTodoCategory, setNewTodoCategory] = useState<TodoCategoryTag>('Work');

  const [workspaceView, setWorkspaceView] = useState<WorkspaceViewMode>('calendar');
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');
  const [filterMode, setFilterMode] = useState<StatusFilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [calendarYear, setCalendarYear] = useState<number>(todayDate.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(todayDate.getMonth());
  const [selectedDateIso, setSelectedDateIso] = useState<string | null>(todayIso);
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
  const [useSamplePreview, setUseSamplePreview] = useState<boolean>(false);

  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<'ready' | 'pending_approval' | 'error'>('ready');
  const [errorState, setErrorState] = useState<ErrorState>(DEFAULT_ERROR_STATE);

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setAuthState('ready');
    setErrorState(DEFAULT_ERROR_STATE);

    try {
      const response = await api.get<TodoItem[]>('/todos/');
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

  const sampleTodos = useMemo(() => buildSamplePreviewTodos(todayDate), [todayDate]);
  const activeDataset = useSamplePreview && todos.length === 0 ? sampleTodos : todos;

  const handleAddTodo = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTodoTitle.trim()) return;

    const payloadDueIso = newTodoDueDate
      ? new Date(`${newTodoDueDate}T09:00:00`).toISOString()
      : null;

    try {
      const response = await api.post<TodoItem>('/todos/', {
        title: newTodoTitle.trim(),
        started_on: newTodoStartDate || null,
        due_date: payloadDueIso,
        priority: newTodoPriority,
        category: newTodoCategory,
      });

      if (response.data) {
        setTodos((currentTodos) => [...currentTodos, response.data]);
        setNewTodoTitle('');
        setNewTodoStartDate('');
        setUseSamplePreview(false);
      }
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  const handleToggleTodo = async (todo: TodoItem) => {
    if (todo.id.startsWith('sample-')) return;
    const nextStatus = todo.status === 'completed' ? 'pending' : 'completed';

    try {
      const response = await api.put<TodoItem>(`/todos/${todo.id}`, {
        status: nextStatus,
      });

      if (response.data) {
        setTodos((currentTodos) =>
          currentTodos.map((item) => (item.id === todo.id ? response.data : item)),
        );
        setSelectedTodo((currentSelected) =>
          currentSelected?.id === todo.id ? response.data : currentSelected,
        );
      }
    } catch (error) {
      console.error('Failed to update todo status:', error);
    }
  };

  const handleAssignDateToTodo = async (todo: TodoItem, targetDateIso: string) => {
    if (todo.id.startsWith('sample-')) return;
    try {
      const response = await api.put<TodoItem>(`/todos/${todo.id}`, {
        due_date: new Date(`${targetDateIso}T09:00:00`).toISOString(),
      });

      if (response.data) {
        setTodos((currentTodos) =>
          currentTodos.map((item) => (item.id === todo.id ? response.data : item)),
        );
        setSelectedTodo(response.data);
      }
    } catch (error) {
      console.error('Failed to assign date to todo:', error);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (todoId.startsWith('sample-')) return;
    try {
      await api.delete(`/todos/${todoId}`);
      setTodos((currentTodos) => currentTodos.filter((item) => item.id !== todoId));
      setSelectedTodo((currentSelected) =>
        currentSelected?.id === todoId ? null : currentSelected,
      );
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const handleShiftCalendarMonth = (monthDelta: number) => {
    const shiftedDate = new Date(calendarYear, calendarMonth + monthDelta, 1);
    setCalendarYear(shiftedDate.getFullYear());
    setCalendarMonth(shiftedDate.getMonth());
  };

  const handleResetToToday = () => {
    setCalendarYear(todayDate.getFullYear());
    setCalendarMonth(todayDate.getMonth());
    setSelectedDateIso(todayIso);
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

  const completedCount = activeDataset.filter((todo) => todo.status === 'completed').length;
  const overdueCount = activeDataset.filter((todo) => isTodoOverdue(todo, todayIso)).length;
  const pendingCount = activeDataset.length - completedCount;
  const progressPercent =
    activeDataset.length > 0 ? Math.round((completedCount / activeDataset.length) * 100) : 0;

  const filteredTodos = activeDataset.filter((todo) => {
    if (filterMode === 'pending' && todo.status === 'completed') return false;
    if (filterMode === 'completed' && todo.status !== 'completed') return false;
    if (filterMode === 'overdue' && !isTodoOverdue(todo, todayIso)) return false;

    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      const matchesTitle = todo.title.toLowerCase().includes(normalizedQuery);
      const matchesDesc = (todo.description ?? '').toLowerCase().includes(normalizedQuery);
      if (!matchesTitle && !matchesDesc) return false;
    }

    return true;
  });

  const undatedTodos = filteredTodos.filter((todo) => !extractIsoDatePart(todo.due_date));

  const listFilteredByStripDate =
    workspaceView === 'list' && selectedDateIso
      ? filteredTodos.filter((todo) => {
          const dueIso = extractIsoDatePart(todo.due_date);
          const startIso = extractIsoDatePart(todo.started_on) ?? dueIso;
          if (!dueIso || !startIso) return false;
          return selectedDateIso >= startIso && selectedDateIso <= dueIso;
        })
      : filteredTodos;

  return (
    <div className="min-h-screen bg-subtle-grid pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Card className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-emerald-100/60">Total Tasks</div>
              <div className="text-2xl font-bold text-white mt-0.5 tabular-nums">
                {activeDataset.length}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#8ee3be]/12 border border-[#8ee3be]/30 flex items-center justify-center text-[#8ee3be]">
              <ListTodo className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-emerald-100/60">In Progress</div>
              <div className="text-2xl font-bold text-[#a7f3d0] mt-0.5 tabular-nums">
                {pendingCount}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-teal-300/12 border border-teal-300/30 flex items-center justify-center text-teal-200">
              <CalendarDays className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-emerald-100/60">Overdue (기한 지남)</div>
              <div className="text-2xl font-bold text-rose-300 mt-0.5 tabular-nums">
                {overdueCount}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/12 border border-rose-400/30 flex items-center justify-center text-rose-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-emerald-100/60">Completion Rate</div>
              <span className="text-sm font-bold text-[#8ee3be] tabular-nums">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden mt-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8ee3be] to-[#6ee7b7] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-xl border border-emerald-200/12 bg-white/[0.03] p-1">
                <button
                  type="button"
                  onClick={() => setWorkspaceView('calendar')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    workspaceView === 'calendar'
                      ? 'bg-[#8ee3be] text-[#062016]'
                      : 'text-emerald-100/70 hover:text-white'
                  }`}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  ▦ Calendar
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceView('list')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    workspaceView === 'list'
                      ? 'bg-[#8ee3be] text-[#062016]'
                      : 'text-emerald-100/70 hover:text-white'
                  }`}
                >
                  <LayoutList className="h-3.5 w-3.5" />
                  ≡ List
                </button>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-emerald-200/10">
                {(['all', 'pending', 'completed', 'overdue'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFilterMode(mode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      filterMode === mode
                        ? 'bg-[#8ee3be]/20 text-[#8ee3be] border border-[#8ee3be]/40'
                        : 'text-emerald-100/60 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {todos.length === 0 && (
                <button
                  type="button"
                  onClick={() => setUseSamplePreview((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    useSamplePreview
                      ? 'border-[#8ee3be]/50 bg-[#8ee3be]/15 text-[#8ee3be]'
                      : 'border-emerald-200/15 bg-white/[0.03] text-emerald-100/70 hover:text-white'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {useSamplePreview ? '샘플 일정 미리보기 켜짐' : '샘플 일정 미리보기'}
                </button>
              )}
            </div>

            <div className="relative w-full lg:w-64">
              <Search className="h-3.5 w-3.5 text-emerald-200/45 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="할 일 검색…"
                className="h-9 pl-8 text-xs"
              />
            </div>
          </div>

          <form
            onSubmit={handleAddTodo}
            className="mt-3.5 pt-3.5 border-t border-emerald-200/10 flex flex-col sm:flex-row gap-2.5"
          >
            <Input
              type="text"
              value={newTodoTitle}
              onChange={(event) => setNewTodoTitle(event.target.value)}
              maxLength={200}
              placeholder="Add a new task (max 200 chars)…"
              className="flex-1 h-10"
            />
            <Input
              type="date"
              value={newTodoStartDate}
              onChange={(event) => setNewTodoStartDate(event.target.value)}
              className="w-full sm:w-36 h-10 text-xs font-mono"
              aria-label="Start date (optional)"
              title="시작일 (선택 — 기간 막대용)"
            />
            <Input
              type="date"
              value={newTodoDueDate}
              onChange={(event) => setNewTodoDueDate(event.target.value)}
              className="w-full sm:w-36 h-10 text-xs font-mono"
              aria-label="Due date"
              title="마감일"
            />
            <select
              value={newTodoCategory}
              onChange={(event) => setNewTodoCategory(event.target.value as TodoCategoryTag)}
              aria-label="Category"
              className="h-10 rounded-xl border border-emerald-200/15 bg-white/[0.04] px-3 text-xs text-emerald-50 focus:outline-none focus:ring-2 focus:ring-[#8ee3be]"
            >
              <option value="Work" className="bg-[#0d1512]">
                Work
              </option>
              <option value="Infra" className="bg-[#0d1512]">
                Infra
              </option>
              <option value="Personal" className="bg-[#0d1512]">
                Personal
              </option>
              <option value="Study" className="bg-[#0d1512]">
                Study
              </option>
            </select>
            <select
              value={newTodoPriority}
              onChange={(event) => setNewTodoPriority(Number(event.target.value))}
              aria-label="Priority"
              className="h-10 rounded-xl border border-emerald-200/15 bg-white/[0.04] px-3 text-xs text-emerald-50 focus:outline-none focus:ring-2 focus:ring-[#8ee3be]"
            >
              <option value={1} className="bg-[#0d1512]">
                P1 긴급
              </option>
              <option value={2} className="bg-[#0d1512]">
                P2 높음
              </option>
              <option value={3} className="bg-[#0d1512]">
                P3 보통
              </option>
              <option value={4} className="bg-[#0d1512]">
                P4 낮음
              </option>
            </select>
            <Button type="submit" className="h-10 px-5 shrink-0">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </form>
        </Card>

        {workspaceView === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 xl:col-span-9">
              <MonthCalendarGrid
                year={calendarYear}
                monthZeroIndexed={calendarMonth}
                todos={filteredTodos}
                todayIso={todayIso}
                selectedDateIso={selectedDateIso}
                selectedTodoId={selectedTodo?.id ?? null}
                calendarMode={calendarMode}
                onSelectDateIso={(dateIso) => {
                  setSelectedDateIso(dateIso);
                  setNewTodoDueDate(dateIso);
                }}
                onSelectTodo={(todo) => setSelectedTodo(todo)}
                onChangeMonthOffset={handleShiftCalendarMonth}
                onResetToToday={handleResetToToday}
                onChangeCalendarMode={setCalendarMode}
              />
            </div>

            <div className="lg:col-span-4 xl:col-span-3">
              <UndatedBacklogRail
                undatedTodos={undatedTodos}
                selectedTodo={selectedTodo}
                selectedDateIso={selectedDateIso}
                todayIso={todayIso}
                onSelectTodo={setSelectedTodo}
                onToggleTodoStatus={(todo) => {
                  void handleToggleTodo(todo);
                }}
                onAssignDateToTodo={(todo, targetIso) => {
                  void handleAssignDateToTodo(todo, targetIso);
                }}
                onDeleteTodo={(todoId) => {
                  void handleDeleteTodo(todoId);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <ScheduleMiniStrip
              todos={filteredTodos}
              todayIso={todayIso}
              selectedDateIso={selectedDateIso}
              onSelectDateIso={setSelectedDateIso}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <Card className="lg:col-span-8 xl:col-span-9">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#d8f9e9] via-[#8ee3be] to-[#6ee7b7]">
                        Task Workspace
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Organize daily priorities and track deadlines alongside your calendar.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {listFilteredByStripDate.length}건 표시 중
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  {listFilteredByStripDate.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-emerald-200/15 bg-white/[0.02] py-12 px-4 text-center">
                      <CheckCircle2 className="h-8 w-8 text-[#8ee3be]/60 mx-auto mb-2.5" />
                      <p className="text-sm text-emerald-100/60">
                        {activeDataset.length === 0
                          ? 'No tasks yet. Create your first task above!'
                          : `No ${filterMode} tasks found.`}
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-2.5">
                      {listFilteredByStripDate.map((todo) => {
                        const isOverdue = isTodoOverdue(todo, todayIso);
                        const dueIso = extractIsoDatePart(todo.due_date);

                        return (
                          <li
                            key={todo.id}
                            onClick={() => setSelectedTodo(todo)}
                            className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-emerald-200/10 hover:border-[#8ee3be]/35 hover:bg-white/[0.05] transition-all group cursor-pointer"
                          >
                            <div
                              className="flex items-center gap-3.5 min-w-0"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <Checkbox
                                checked={todo.status === 'completed'}
                                onCheckedChange={() => {
                                  void handleToggleTodo(todo);
                                }}
                                aria-label={`Mark ${todo.title} as ${
                                  todo.status === 'completed' ? 'pending' : 'completed'
                                }`}
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
                              {isOverdue && <Badge variant="destructive">⚠ 지남</Badge>}
                              {dueIso && (
                                <Badge variant="outline" className="font-mono font-normal">
                                  {dueIso}
                                </Badge>
                              )}
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handleDeleteTodo(todo.id);
                                }}
                                aria-label={`Delete ${todo.title}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <div className="lg:col-span-4 xl:col-span-3">
                <UndatedBacklogRail
                  undatedTodos={undatedTodos}
                  selectedTodo={selectedTodo}
                  selectedDateIso={selectedDateIso}
                  todayIso={todayIso}
                  onSelectTodo={setSelectedTodo}
                  onToggleTodoStatus={(todo) => {
                    void handleToggleTodo(todo);
                  }}
                  onAssignDateToTodo={(todo, targetIso) => {
                    void handleAssignDateToTodo(todo, targetIso);
                  }}
                  onDeleteTodo={(todoId) => {
                    void handleDeleteTodo(todoId);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
