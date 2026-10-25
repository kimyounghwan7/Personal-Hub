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
    <div className="rounded-2xl border border-emerald-200/12 bg-[#0d1512]/90 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100/80">
          <CalendarRange className="h-4 w-4 text-[#8ee3be]" />
          <span>5-Week Schedule Strip (35일 일정 밀도 타임라인)</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-emerald-100/55">
          {selectedDateIso ? (
            <button
              type="button"
              onClick={() => onSelectDateIso(null)}
              className="text-[#8ee3be] hover:underline font-mono"
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
                  ? 'border-[#8ee3be] bg-[#8ee3be]/20 text-white'
                  : isToday
                    ? 'border-[#8ee3be]/60 bg-[#8ee3be]/10 text-[#8ee3be]'
                    : 'border-emerald-200/10 bg-white/[0.02] text-emerald-100/60 hover:border-emerald-200/30'
              }`}
            >
              <span className="font-mono tabular-nums">{dayDate.getDate()}</span>
              <span className="mt-1 flex items-center gap-0.5 h-2">
                {matchingTodos.length === 0 ? (
                  <span className="h-1 w-1 rounded-full bg-white/10" />
                ) : hasOverdue ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                ) : hasActive ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8ee3be]" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-200/40" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
