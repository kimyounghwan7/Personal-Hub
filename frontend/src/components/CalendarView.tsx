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
          <div className="flex flex-col items-center mt-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Calendar</h2>
      <div className="w-full max-w-sm mx-auto min-h-[300px]">
        {isMounted ? (
          <Calendar tileContent={tileContent} className="w-full border-none" locale="ko" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Loading Calendar...</div>
        )}
      </div>
    </div>
  );
}
