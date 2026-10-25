"use client";

import { CalendarRange } from 'lucide-react';
import {
  extractIsoDatePart,
  formatIsoDate,
  isTodoOverdue,
} from '@/components/todos/calendar-math';
import { TodoItem } from '@/components/todos/types';

type ScheduleMiniStripProps = {
  todos: TodoItem[];
  todayIso: string;
  selectedDateIso: string | null;
  onSelectDateIso: (dateIso: string | null) => void;
};

export default function ScheduleMiniStrip({
  todos,
  todayIso,
  selectedDateIso,
  onSelectDateIso,
}: ScheduleMiniStripProps) {
  const baseDate = new Date();
  const mondayOffset = (baseDate.getDay() + 6) % 7;
  const startOfStrip = new Date(baseDate);
  startOfStrip.setDate(baseDate.getDate() - mondayOffset - 7);

  const stripDays: Date[] = [];
  for (let offset = 0; offset < 35; offset += 1) {
    const cellDate = new Date(startOfStrip);
    cellDate.setDate(startOfStrip.getDate() + offset);
    stripDays.push(cellDate);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <CalendarRange className="h-4 w-4 text-[#18865b]" />
          <span>5-Week Schedule Strip (35일 일정 밀도 타임라인)</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          {selectedDateIso ? (
            <button
              type="button"
              onClick={() => onSelectDateIso(null)}
              className="text-[#18865b] hover:underline font-mono font-medium"
            >
              날짜 필터 해제 ({selectedDateIso})
            </button>
          ) : (
            <span>날짜 셀을 클릭하면 해당 일자 할 일만 필터링합니다</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-35 gap-1">
        {stripDays.map((dayDate) => {
          const dayIso = formatIsoDate(dayDate);
          const isToday = dayIso === todayIso;
          const isSelected = dayIso === selectedDateIso;

          const matchingTodos = todos.filter((todo) => {
            const dueIso = extractIsoDatePart(todo.due_date);
            const startIso = extractIsoDatePart(todo.started_on) ?? dueIso;
            if (!dueIso || !startIso) return false;
            return dayIso >= startIso && dayIso <= dueIso;
          });

          const hasOverdue = matchingTodos.some((todo) => isTodoOverdue(todo, todayIso));
          const hasActive = matchingTodos.some((todo) => todo.status !== 'completed');

          return (
            <button
              key={dayIso}
              type="button"
              onClick={() => onSelectDateIso(isSelected ? null : dayIso)}
              title={`${dayIso} (${matchingTodos.length}건)`}
              className={`group flex flex-col items-center justify-between py-1.5 px-1 rounded-lg border text-[10px] transition-all ${
                isSelected
                  ? 'border-[#18865b] bg-[#18865b] text-white shadow-sm'
                  : isToday
                    ? 'border-[#b6e2cf] bg-[#e6f4ee] text-[#126b48] font-bold'
                    : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <span className="font-mono tabular-nums">{dayDate.getDate()}</span>
              <span className="mt-1 flex items-center gap-0.5 h-2">
                {matchingTodos.length === 0 ? (
                  <span className="h-1 w-1 rounded-full bg-slate-200" />
                ) : hasOverdue ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                ) : hasActive ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#18865b]" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
