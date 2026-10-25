"use client";

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarCustom.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full max-w-sm mx-auto min-h-[300px]">
          {isMounted ? (
            <Calendar tileContent={tileContent} className="w-full border-none" locale="ko" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">Loading Calendar...</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
