import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from 'lucide-react';
import { Task } from '../types';
import { CATEGORIES } from '../data/categories';

interface CalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onSelectTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Build calendar matrix
  const dayCells = [];
  // Leading empty cells
  for (let i = 0; i < firstDayOfMonth; i++) {
    dayCells.push(null);
  }
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    dayCells.push(day);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const getTasksForDate = (dayNumber: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNumber).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    return tasks.filter((t) => t.dueDate === dateStr);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Calendar Header Controls */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {monthNames[month]} năm {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Hôm nay
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">
        <div className="py-2 text-rose-500">CN</div>
        <div className="py-2">Thứ 2</div>
        <div className="py-2">Thứ 3</div>
        <div className="py-2">Thứ 4</div>
        <div className="py-2">Thứ 5</div>
        <div className="py-2">Thứ 6</div>
        <div className="py-2 text-blue-500">Thứ 7</div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 auto-rows-fr">
        {dayCells.map((day, index) => {
          if (day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-[90px] bg-slate-50/40 dark:bg-slate-900/30 rounded-xl p-2 border border-transparent"
              />
            );
          }

          const dayTasks = getTasksForDate(day);
          const formattedMonth = String(month + 1).padStart(2, '0');
          const formattedDay = String(day).padStart(2, '0');
          const thisDateStr = `${year}-${formattedMonth}-${formattedDay}`;
          const isToday = thisDateStr === todayStr;

          return (
            <div
              key={`day-${day}`}
              className={`min-h-[100px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
                isToday
                  ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 ring-1 ring-blue-500/50'
                  : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {day}
                </span>

                {dayTasks.length > 0 && (
                  <span className="text-2xs font-semibold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {dayTasks.length}
                  </span>
                )}
              </div>

              {/* Tasks List snippet */}
              <div className="space-y-1 overflow-y-auto max-h-[70px] custom-scrollbar">
                {dayTasks.map((t) => {
                  const cat = CATEGORIES.find((c) => c.id === t.category) || CATEGORIES[0];
                  return (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className={`text-2xs p-1 rounded-md font-medium truncate cursor-pointer transition-transform hover:scale-[1.02] flex items-center gap-1 ${cat.bgColor} ${cat.textColor}`}
                      title={t.title}
                    >
                      {t.completed && <Check className="w-2.5 h-2.5 shrink-0" />}
                      <span className="truncate">{t.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
