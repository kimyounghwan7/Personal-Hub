"use client";

import { CalendarDays, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  buildMonthWeekRows,
  extractIsoDatePart,
  formatIsoDate,
  isTodoOverdue,
} from '@/components/todos/calendar-math';
import { CalendarMode, TodoItem } from '@/components/todos/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type MonthCalendarGridProps = {
  year: number;
  monthZeroIndexed: number;
  todos: TodoItem[];
  todayIso: string;
  selectedDateIso: string | null;
  selectedTodoId: string | null;
  calendarMode: CalendarMode;
  onSelectDateIso: (dateIso: string) => void;
  onSelectTodo: (todo: TodoItem) => void;
  onChangeMonthOffset: (monthDelta: number) => void;
  onResetToToday: () => void;
  onChangeCalendarMode: (nextMode: CalendarMode) => void;
};

const WEEKDAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

export default function MonthCalendarGrid({
  year,
  monthZeroIndexed,
  todos,
  todayIso,
  selectedDateIso,
  selectedTodoId,
  calendarMode,
  onSelectDateIso,
  onSelectTodo,
  onChangeMonthOffset,
  onResetToToday,
  onChangeCalendarMode,
}: MonthCalendarGridProps) {
  const weekRows = buildMonthWeekRows(year, monthZeroIndexed, todos);
  const monthLabel = new Date(year, monthZeroIndexed, 1).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  });

  const datedTodos = todos
    .filter((todo) => Boolean(extractIsoDatePart(todo.due_date)))
    .sort((leftTodo, rightTodo) => {
      const leftIso = extractIsoDatePart(leftTodo.due_date) ?? '9999-12-31';
      const rightIso = extractIsoDatePart(rightTodo.due_date) ?? '9999-12-31';
      return leftIso.localeCompare(rightIso);
    });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => onChangeMonthOffset(-1)}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2.5 text-sm font-bold text-slate-800 tabular-nums">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => onChangeMonthOffset(1)}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetToToday}
            className="h-8 text-xs px-3"
          >
            오늘
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-600 mr-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#18865b]" />
              진행 중
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              기한 지남
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              완료됨
            </span>
          </div>

          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => onChangeCalendarMode('month')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                calendarMode === 'month'
                  ? 'bg-[#18865b] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => onChangeCalendarMode('agenda')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                calendarMode === 'agenda'
                  ? 'bg-[#18865b] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agenda
            </button>
          </div>
        </div>
      </div>

      {calendarMode === 'month' ? (
        <div>
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {WEEKDAY_LABELS.map((dayName, dayIndex) => (
              <div
                key={dayName}
                className={`py-2.5 px-2 text-center text-[11px] font-semibold tracking-wider ${
                  dayIndex >= 5 ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          <div className="divide-y divide-slate-100">
            {weekRows.map((weekRow) => {
              const visibleSpanSegments = weekRow.spanSegments.filter(
                (segment) => segment.laneIndex < 2,
              );

              return (
                <div key={weekRow.weekIndex} className="relative">
                  {visibleSpanSegments.length > 0 && (
                    <div className="grid grid-cols-7 gap-x-1 gap-y-1 px-1.5 pt-8 pb-1 pointer-events-none">
                      {visibleSpanSegments.map((segment) => {
                        const isOverdue = isTodoOverdue(segment.todo, todayIso);
                        const isDone = segment.todo.status === 'completed';
                        const isSelected = selectedTodoId === segment.todo.id;

                        const barStyleClass = isDone
                          ? 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                          : isOverdue
                            ? 'bg-rose-50 border-rose-200 text-rose-600 font-semibold'
                            : 'bg-[#e6f4ee] border-[#b6e2cf] text-[#126b48] font-medium';

                        return (
                          <button
                            key={`${segment.todo.id}-w${weekRow.weekIndex}`}
                            type="button"
                            onClick={() => onSelectTodo(segment.todo)}
                            style={{
                              gridColumn: `${segment.startCol + 1} / span ${segment.spanCols}`,
                            }}
                            className={`pointer-events-auto flex items-center justify-between gap-1.5 px-2 py-0.5 text-[11px] border rounded-md truncate transition-all hover:brightness-95 ${barStyleClass} ${
                              isSelected ? 'ring-1 ring-[#18865b]' : ''
                            }`}
                          >
                            <span className="truncate">
                              {isDone && '✓ '}
                              {segment.todo.title}
                            </span>
                            {isOverdue && (
                              <span className="shrink-0 text-[10px] font-semibold text-rose-600">
                                ⚠ 지남
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[108px]">
                    {weekRow.days.map((dayDate) => {
                      const dayIso = formatIsoDate(dayDate);
                      const isCurrentMonth = dayDate.getMonth() === monthZeroIndexed;
                      const isToday = dayIso === todayIso;
                      const isSelectedDate = dayIso === selectedDateIso;
                      const dayPointTasks = weekRow.pointTasksByDayIso[dayIso] ?? [];
                      const visiblePointTasks = dayPointTasks.slice(0, 2);
                      const hiddenTaskCount = Math.max(
                        0,
                        dayPointTasks.length - visiblePointTasks.length,
                      );

                      return (
                        <div
                          key={dayIso}
                          onClick={() => onSelectDateIso(dayIso)}
                          className={`group p-1.5 transition-colors cursor-pointer flex flex-col justify-between ${
                            isCurrentMonth
                              ? 'bg-white hover:bg-slate-50/70'
                              : 'bg-slate-50/50 text-slate-400 hover:bg-slate-100/50'
                          } ${
                            isSelectedDate
                              ? 'bg-[#e6f4ee]/40 ring-1 ring-inset ring-[#18865b]'
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`inline-flex h-6 min-w-[24px] px-1.5 items-center justify-center rounded-md text-xs font-semibold tabular-nums ${
                                isToday
                                  ? 'bg-[#18865b] text-white font-bold shadow-sm'
                                  : isCurrentMonth
                                    ? 'text-slate-800'
                                    : 'text-slate-400'
                              }`}
                            >
                              {dayDate.getDate()}
                            </span>
                            {dayPointTasks.length > 0 && (
                              <span className="text-[10px] font-mono text-slate-400">
                                {dayPointTasks.length}건
                              </span>
                            )}
                          </div>

                          <div className="mt-2 space-y-1">
                            {visiblePointTasks.map((todo) => {
                              const isOverdue = isTodoOverdue(todo, todayIso);
                              const isDone = todo.status === 'completed';
                              const isSelected = selectedTodoId === todo.id;

                              return (
                                <button
                                  key={todo.id}
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onSelectTodo(todo);
                                  }}
                                  className={`w-full text-left px-1.5 py-1 rounded-md text-[11px] font-medium truncate flex items-center justify-between gap-1 border transition-all ${
                                    isDone
                                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                                      : isOverdue
                                        ? 'bg-rose-50 border-rose-200 text-rose-600 font-semibold'
                                        : 'bg-[#e6f4ee] border-[#b6e2cf] text-[#126b48] hover:border-[#18865b]'
                                  } ${isSelected ? 'ring-1 ring-[#18865b]' : ''}`}
                                >
                                  <span className="truncate flex items-center gap-1">
                                    {isDone ? (
                                      <Check className="h-3 w-3 shrink-0 text-[#18865b]" />
                                    ) : (
                                      <span
                                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                          isOverdue ? 'bg-rose-500' : 'bg-[#18865b]'
                                        }`}
                                      />
                                    )}
                                    <span className="truncate">{todo.title}</span>
                                  </span>
                                  {isOverdue && (
                                    <span className="shrink-0 text-[9px] font-semibold text-rose-600">
                                      지남
                                    </span>
                                  )}
                                </button>
                              );
                            })}

                            {hiddenTaskCount > 0 && (
                              <div className="text-[10px] font-medium text-[#18865b] px-1">
                                +{hiddenTaskCount} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-5 space-y-2.5 max-h-[540px] overflow-y-auto">
          {datedTodos.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              날짜가 지정된 할 일이 없습니다.
            </div>
          ) : (
            datedTodos.map((todo) => {
              const dueIso = extractIsoDatePart(todo.due_date) ?? '';
              const startIso = extractIsoDatePart(todo.started_on);
              const isOverdue = isTodoOverdue(todo, todayIso);
              const isDone = todo.status === 'completed';

              return (
                <div
                  key={todo.id}
                  onClick={() => onSelectTodo(todo)}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-sm cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CalendarDays className="h-4 w-4 text-[#18865b] shrink-0" />
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-medium truncate ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {todo.title}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {startIso && startIso !== dueIso ? `${startIso} → ${dueIso}` : dueIso}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isOverdue && <Badge variant="destructive">⚠ 지남</Badge>}
                    {isDone && <Badge variant="default">✓ 완료</Badge>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
