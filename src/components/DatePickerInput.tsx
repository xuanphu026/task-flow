import React, { useState } from 'react';
import { Calendar, ChevronDown, Clock } from 'lucide-react';

interface DatePickerInputProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  label?: string;
  showPresets?: boolean;
  className?: string;
  id?: string;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChange,
  label = 'Hạn hoàn thành',
  showPresets = true,
  className = '',
  id,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const getNextWeekStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const today = getTodayStr();
  const tomorrow = getTomorrowStr();
  const nextWeek = getNextWeekStr();

  // Format date display cleanly
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'Chọn ngày hạn';

    const [year, month, day] = dateStr.split('-');
    const formatted = `${day}/${month}/${year}`;

    if (dateStr === today) return `Hôm nay (${day}/${month})`;
    if (dateStr === tomorrow) return `Ngày mai (${day}/${month})`;

    return formatted;
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <div className="relative flex-1 flex items-center h-10 px-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-800 dark:text-slate-200 hover:border-blue-400 dark:hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all shadow-2xs group cursor-pointer">
          <Calendar className="w-4 h-4 text-blue-500 shrink-0 mr-2" />
          <span className="font-medium truncate flex-1 text-slate-800 dark:text-slate-100">
            {formatDisplayDate(value)}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 ml-1 shrink-0" />

          {/* Hidden native date picker overlay */}
          <input
            id={id}
            type="date"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setShowDropdown(false);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
        </div>

        {showPresets && (
          <div className="relative ml-1 z-20">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              title="Chọn nhanh"
              className="h-10 px-2 flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 transition-colors text-2xs font-medium"
            >
              <Clock className="w-3.5 h-3.5" />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 top-11 z-40 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 space-y-1 text-xs">
                  <div className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 uppercase tracking-wider">
                    Chọn nhanh
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(today);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      value === today
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>Hôm nay</span>
                    <span className="text-[10px] opacity-60">H.nay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(tomorrow);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      value === tomorrow
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>Ngày mai</span>
                    <span className="text-[10px] opacity-60">N.mai</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(nextWeek);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      value === nextWeek
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>Tuần sau</span>
                    <span className="text-[10px] opacity-60">+7 ngày</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
