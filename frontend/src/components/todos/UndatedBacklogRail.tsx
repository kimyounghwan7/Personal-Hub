"use client";

import { CalendarPlus, CheckCircle2, Clock3, Inbox, Sparkles, Trash2, X } from 'lucide-react';
import { extractIsoDatePart, isTodoOverdue } from '@/components/todos/calendar-math';
import { TodoItem } from '@/components/todos/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type UndatedBacklogRailProps = {
  undatedTodos: TodoItem[];
  selectedTodo: TodoItem | null;
  selectedDateIso: string | null;
  todayIso: string;
  onSelectTodo: (todo: TodoItem | null) => void;
  onToggleTodoStatus: (todo: TodoItem) => void;
  onAssignDateToTodo: (todo: TodoItem, targetDateIso: string) => void;
  onDeleteTodo: (todoId: string) => void;
};

const PRIORITY_LABELS: Record<number, { label: string; badgeClass: string }> = {
  1: { label: 'P1 긴급', badgeClass: 'border-rose-200 bg-rose-50 text-rose-600 font-semibold' },
  2: { label: 'P2 높음', badgeClass: 'border-amber-200 bg-amber-50 text-amber-700' },
  3: { label: 'P3 보통', badgeClass: 'border-[#b6e2cf] bg-[#e6f4ee] text-[#126b48]' },
  4: { label: 'P4 낮음', badgeClass: 'border-slate-200 bg-slate-100 text-slate-600' },
};

export default function UndatedBacklogRail({
  undatedTodos,
  selectedTodo,
  selectedDateIso,
  todayIso,
  onSelectTodo,
  onToggleTodoStatus,
  onAssignDateToTodo,
  onDeleteTodo,
}: UndatedBacklogRailProps) {
  const targetAssignIso = selectedDateIso ?? todayIso;

  return (
    <div className="space-y-4">
      {selectedTodo ? (
        <Card className="border-[#b6e2cf] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-[11px]">
                  <Sparkles className="h-3 w-3 text-[#18865b]" />
                  Task Peek
                </Badge>
                {selectedTodo.category && (
                  <Badge variant="outline" className="text-[11px]">
                    {selectedTodo.category}
                  </Badge>
                )}
              </div>
              <button
                type="button"
                onClick={() => onSelectTodo(null)}
                className="h-6 w-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close task inspector"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <CardTitle className="text-base text-slate-900 pt-1 leading-snug">
              {selectedTodo.title}
            </CardTitle>
            {selectedTodo.description && (
              <CardDescription className="text-xs text-slate-600 pt-1">
                {selectedTodo.description}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-3 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">상태</span>
                {selectedTodo.status === 'completed' ? (
                  <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200">
                    ✓ 완료됨
                  </Badge>
                ) : isTodoOverdue(selectedTodo, todayIso) ? (
                  <Badge variant="destructive">⚠ 기한 지남</Badge>
                ) : (
                  <Badge variant="default">진행 중</Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">일정 범위</span>
                <span className="font-mono text-slate-800">
                  {extractIsoDatePart(selectedTodo.started_on)
                    ? `${extractIsoDatePart(selectedTodo.started_on)} → ${
                        extractIsoDatePart(selectedTodo.due_date) ?? '미정'
                      }`
                    : extractIsoDatePart(selectedTodo.due_date) ?? '날짜 미지정'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">우선순위</span>
                <span
                  className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${
                    (PRIORITY_LABELS[selectedTodo.priority] ?? PRIORITY_LABELS[3]).badgeClass
                  }`}
                >
                  {(PRIORITY_LABELS[selectedTodo.priority] ?? PRIORITY_LABELS[3]).label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                onClick={() => onToggleTodoStatus(selectedTodo)}
                className="flex-1 h-8 text-xs bg-[#18865b] hover:bg-[#136c49] text-white"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {selectedTodo.status === 'completed' ? '진행 중으로 변경' : '완료 처리'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onDeleteTodo(selectedTodo.id)}
                className="h-8 px-2.5"
                aria-label="Delete selected task"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-slate-900">
              <Inbox className="h-4 w-4 text-[#18865b]" />
              날짜 미지정 백로그
            </CardTitle>
            <Badge variant="outline" className="font-mono text-xs">
              {undatedTodos.length}건
            </Badge>
          </div>
          <CardDescription className="text-xs text-slate-500">
            마감일이 없는 할 일입니다. 캘린더 날짜를 선택한 뒤 즉시 배정할 수 있습니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2.5">
          {undatedTodos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 px-3 text-center">
              <Clock3 className="h-6 w-6 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">
                모든 할 일에 일정이 배정되어 있습니다.
              </p>
            </div>
          ) : (
            undatedTodos.map((todo) => {
              const priorityMeta = PRIORITY_LABELS[todo.priority] ?? PRIORITY_LABELS[3];

              return (
                <div
                  key={todo.id}
                  onClick={() => onSelectTodo(todo)}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-800 leading-snug">
                      {todo.title}
                    </span>
                    <span
                      className={`shrink-0 px-1.5 py-0.5 rounded border text-[10px] font-semibold ${priorityMeta.badgeClass}`}
                    >
                      {priorityMeta.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-slate-500 font-mono">
                      배정 대상: {targetAssignIso}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        onAssignDateToTodo(todo, targetAssignIso);
                      }}
                      className="h-7 px-2.5 text-[11px] border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      <CalendarPlus className="h-3 w-3 text-[#18865b]" />
                      날짜 배정
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
