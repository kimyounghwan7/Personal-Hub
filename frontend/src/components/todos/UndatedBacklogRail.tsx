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
  1: { label: 'P1 긴급', badgeClass: 'border-rose-400/40 bg-rose-500/15 text-rose-200' },
  2: { label: 'P2 높음', badgeClass: 'border-amber-300/40 bg-amber-400/15 text-amber-200' },
  3: { label: 'P3 보통', badgeClass: 'border-[#8ee3be]/40 bg-[#8ee3be]/15 text-[#8ee3be]' },
  4: { label: 'P4 낮음', badgeClass: 'border-emerald-200/20 bg-white/[0.04] text-emerald-100/65' },
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
        <Card className="border-[#8ee3be]/35 bg-[#0e1915]/95">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-[11px]">
                  <Sparkles className="h-3 w-3" />
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
                className="h-6 w-6 rounded-lg flex items-center justify-center text-emerald-100/50 hover:text-white hover:bg-white/[0.06]"
                aria-label="Close task inspector"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <CardTitle className="text-base text-emerald-50 pt-1 leading-snug">
              {selectedTodo.title}
            </CardTitle>
            {selectedTodo.description && (
              <CardDescription className="text-xs text-emerald-100/65 pt-1">
                {selectedTodo.description}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-3 text-xs">
            <div className="rounded-xl border border-emerald-200/10 bg-white/[0.025] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-100/55">상태</span>
                {selectedTodo.status === 'completed' ? (
                  <Badge variant="default">✓ 완료됨</Badge>
                ) : isTodoOverdue(selectedTodo, todayIso) ? (
                  <Badge variant="destructive">⚠ 기한 지남</Badge>
                ) : (
                  <Badge variant="secondary">진행 중</Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-emerald-100/55">일정 범위</span>
                <span className="font-mono text-emerald-50">
                  {extractIsoDatePart(selectedTodo.started_on)
                    ? `${extractIsoDatePart(selectedTodo.started_on)} → ${
                        extractIsoDatePart(selectedTodo.due_date) ?? '미정'
                      }`
                    : extractIsoDatePart(selectedTodo.due_date) ?? '날짜 미지정'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-emerald-100/55">우선순위</span>
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
                className="flex-1 h-8 text-xs"
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

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Inbox className="h-4 w-4 text-[#8ee3be]" />
              날짜 미지정 백로그
            </CardTitle>
            <Badge variant="outline" className="font-mono text-xs">
              {undatedTodos.length}건
            </Badge>
          </div>
          <CardDescription className="text-xs">
            마감일이 없는 할 일입니다. 캘린더 날짜를 선택한 뒤 즉시 배정할 수 있습니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2.5">
          {undatedTodos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-emerald-200/15 bg-white/[0.015] py-8 px-3 text-center">
              <Clock3 className="h-6 w-6 text-[#8ee3be]/55 mx-auto mb-2" />
              <p className="text-xs text-emerald-100/55">
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
                  className="p-3 rounded-xl border border-emerald-200/10 bg-white/[0.025] hover:border-[#8ee3be]/35 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-emerald-50 leading-snug">
                      {todo.title}
                    </span>
                    <span
                      className={`shrink-0 px-1.5 py-0.5 rounded border text-[10px] font-semibold ${priorityMeta.badgeClass}`}
                    >
                      {priorityMeta.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-emerald-100/45 font-mono">
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
                      className="h-7 px-2.5 text-[11px]"
                    >
                      <CalendarPlus className="h-3 w-3 text-[#8ee3be]" />
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
