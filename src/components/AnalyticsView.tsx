import React from 'react';
import {
  CheckCircle2,
  Clock,
  Flame,
  AlertTriangle,
  TrendingUp,
  PieChart,
  BarChart,
  Target,
  Award,
} from 'lucide-react';
import { ProductivityStats, Task } from '../types';
import { CATEGORIES, PRIORITY_CONFIG } from '../data/categories';

interface AnalyticsViewProps {
  stats: ProductivityStats;
  tasks: Task[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats, tasks }) => {
  // Category Breakdown
  const categoryCounts = CATEGORIES.map((cat) => {
    const total = tasks.filter((t) => t.category === cat.id).length;
    const completed = tasks.filter((t) => t.category === cat.id && t.completed).length;
    return {
      category: cat,
      total,
      completed,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  // Priority Breakdown
  const priorityCounts = (Object.keys(PRIORITY_CONFIG) as (keyof typeof PRIORITY_CONFIG)[]).map((p) => {
    const total = tasks.filter((t) => t.priority === p).length;
    const completed = tasks.filter((t) => t.priority === p && t.completed).length;
    return {
      priority: p,
      config: PRIORITY_CONFIG[p],
      total,
      completed,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Completion Rate */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
              Tỷ lệ hoàn thành
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.completionRate}%
            </div>
            <p className="text-2xs text-slate-500 mt-1">
              {stats.completedTasks}/{stats.totalTasks} công việc đã xong
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Active Tasks */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
              Công việc đang chờ
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.activeTasks}
            </div>
            <p className="text-2xs text-slate-500 mt-1">Cần hoàn thành trong thời gian tới</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Overdue Tasks */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
              Công việc quá hạn
            </span>
            <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {stats.overdueTasks}
            </div>
            <p className="text-2xs text-slate-500 mt-1">Cần ưu tiên xử lý ngay</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Active Streak */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
              Chuỗi liên tục
            </span>
            <div className="text-3xl font-black text-amber-500 mt-1 flex items-center gap-1">
              {stats.streakDays} <span className="text-lg font-normal text-slate-400">Ngày</span>
            </div>
            <p className="text-2xs text-slate-500 mt-1">Năng suất liên tục xuất sắc</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
        </div>
      </div>

      {/* Progress Bars by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-500" />
            Tiến độ theo danh mục
          </h3>

          <div className="space-y-4">
            {categoryCounts.map(({ category, total, completed, rate }) => (
              <div key={category.id}>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${category.bgColor}`} />
                    {category.label}
                  </span>
                  <span className="text-slate-500">
                    {completed}/{total} ({rate}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${rate}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-indigo-500" />
            Phân bổ theo mức độ ưu tiên
          </h3>

          <div className="space-y-4">
            {priorityCounts.map(({ priority, config, total, completed }) => {
              const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div key={priority} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-2xs font-medium text-slate-500">
                      {completed} đã xong / {total} tổng số
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
