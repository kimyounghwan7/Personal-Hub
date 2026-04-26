"use client";

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarCustom.css'; // Custom styles for tailwind overriding

type CalendarViewProps = {
  todos: any[];
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
          new Date(todo.due_date).toDateString() === date.toDateString()
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
    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/10 text-white">
      <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Calendar</h2>
      <div className="w-full max-w-sm mx-auto min-h-[300px]">
        {isMounted ? (
          <Calendar tileContent={tileContent} className="w-full border-none" locale="ko" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">Loading Calendar...</div>
        )}
      </div>
    </div>
  );
}
