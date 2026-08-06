import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Star, Target } from 'lucide-react';
import { ProductivityStats } from '../types';

interface StatsOverviewProps {
  stats: ProductivityStats;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {/* Total & Completion Rate */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-sm">
          {stats.completionRate}%
        </div>
        <div className="min-w-0">
          <div className="text-2xs text-slate-400 font-semibold uppercase">Tiến độ tổng</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {stats.completedTasks} / {stats.totalTasks} việc
          </div>
        </div>
      </div>

      {/* Active Tasks */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-2xs text-slate-400 font-semibold uppercase">Cần thực hiện</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {stats.activeTasks} việc
          </div>
        </div>
      </div>

      {/* Overdue */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-2xs text-slate-400 font-semibold uppercase">Đã quá hạn</div>
          <div className="text-sm font-bold text-rose-600 dark:text-rose-400 truncate">
            {stats.overdueTasks} việc
          </div>
        </div>
      </div>

      {/* Starred */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
          <Star className="w-5 h-5 fill-amber-500" />
        </div>
        <div className="min-w-0">
          <div className="text-2xs text-slate-400 font-semibold uppercase">Quan trọng</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {stats.starredTasks} việc
          </div>
        </div>
      </div>
    </div>
  );
};
