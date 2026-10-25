"use client";

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarCustom.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type CalendarTodoItem = {
  id: string;
  title: string;
  due_date?: string | null;
  status?: string;
};

type CalendarViewProps = {
  todos: CalendarTodoItem[];
};

export default function CalendarView({ todos }: CalendarViewProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayTodos = todos.filter(
        (todo) =>
          todo.due_date &&
          new Date(todo.due_date).toDateString() === date.toDateString(),
      );

      if (dayTodos.length > 0) {
        return (
          <div className="flex flex-col items-center">
            <div className="todo-marker"></div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <Card className="bg-white border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-slate-900">
          Monthly Schedule
        </CardTitle>
        <CardDescription className="text-slate-500">
          Highlighted dots indicate scheduled tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full max-w-sm mx-auto min-h-[300px]">
          {isMounted ? (
            <Calendar tileContent={tileContent} className="w-full border-none" locale="ko" />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              Loading Calendar…
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
