import React from 'react';
import {
  CheckCircle2,
  Clock,
  ListTodo,
  Plus,
  Star,
  Calendar,
  AlertCircle,
  MoreHorizontal,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task } from '../types';
import { CATEGORIES, PRIORITY_CONFIG } from '../data/categories';
import { formatVietnameseDate } from '../utils/storage';

interface KanbanBoardProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onOpenQuickAdd: () => void;
  onMoveTaskStatus: (taskId: string, targetColumn: 'todo' | 'inProgress' | 'done') => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onToggleComplete,
  onToggleStar,
  onSelectTask,
  onOpenQuickAdd,
  onMoveTaskStatus,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Column categorization logic
  const todoTasks = tasks.filter(
    (t) => !t.completed && (!t.subtasks || t.subtasks.every((s) => !s.completed))
  );

  const inProgressTasks = tasks.filter(
    (t) =>
      !t.completed &&
      t.subtasks &&
      t.subtasks.length > 0 &&
      t.subtasks.some((s) => s.completed) &&
      !t.subtasks.every((s) => s.completed)
  );

  const completedTasks = tasks.filter((t) => t.completed);

  const renderKanbanCard = (task: Task, currentColumn: 'todo' | 'inProgress' | 'done') => {
    const categoryConfig = CATEGORIES.find((c) => c.id === task.category) || CATEGORIES[0];
    const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
    const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;

    const subtasksCount = task.subtasks?.length || 0;
    const subtasksCompleted = task.subtasks?.filter((s) => s.completed).length || 0;

    return (
      <div
        key={task.id}
        onClick={() => onSelectTask(task)}
        className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer group"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <span
            className={`px-2 py-0.5 rounded-md text-2xs font-semibold ${categoryConfig.bgColor} ${categoryConfig.textColor}`}
          >
            {categoryConfig.label}
          </span>

          <div className="flex items-center gap-1">
            <span
              className={`px-1.5 py-0.5 rounded-md text-2xs font-semibold border ${priorityConfig.badgeClass}`}
            >
              {priorityConfig.label}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(task.id);
              }}
              className="p-1 text-slate-300 hover:text-amber-400 dark:text-slate-600"
            >
              <Star
                className={`w-3.5 h-3.5 ${task.isStarred ? 'fill-amber-400 text-amber-400' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Title */}
        <h4
          className={`text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5 ${
            task.completed ? 'line-through text-slate-400' : ''
          }`}
        >
          {task.title}
        </h4>

        {/* Subtask count */}
        {subtasksCount > 0 && (
          <div className="text-2xs text-slate-500 mb-2 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-500" />
            <span>
              Bước con: {subtasksCompleted}/{subtasksCount}
            </span>
          </div>
        )}

        {/* Footer: Date & Move Quick Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-2xs">
          <span
            className={`flex items-center gap-1 font-medium ${
              isOverdue
                ? 'text-rose-600 dark:text-rose-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Calendar className="w-3 h-3" />
            {formatVietnameseDate(task.dueDate)}
          </span>

          {/* Column movement dropdown/buttons */}
          <div className="flex items-center gap-1">
            {currentColumn !== 'todo' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveTaskStatus(task.id, 'todo');
                }}
                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                title="Chuyển về Cần làm"
              >
                ← Cần làm
              </button>
            )}

            {currentColumn !== 'done' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveTaskStatus(task.id, 'done');
                  confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
                }}
                className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                title="Chuyển sang Hoàn thành"
              >
                Xong ✓
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      {/* Column 1: To Do */}
      <div className="bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Cần thực hiện
            </h3>
            <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-2xs font-bold rounded-full">
              {todoTasks.length}
            </span>
          </div>

          <button
            onClick={onOpenQuickAdd}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
            title="Thêm việc mới"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 min-h-[250px]">
          {todoTasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
              Không có công việc cần thực hiện
            </div>
          ) : (
            todoTasks.map((t) => renderKanbanCard(t, 'todo'))
          )}
        </div>
      </div>

      {/* Column 2: In Progress */}
      <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/40">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Đang thực hiện
            </h3>
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-2xs font-bold rounded-full">
              {inProgressTasks.length}
            </span>
          </div>
        </div>

        <div className="space-y-3 min-h-[250px]">
          {inProgressTasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-blue-200 dark:border-blue-900/40 rounded-xl">
              Chưa có việc đang trong tiến trình
            </div>
          ) : (
            inProgressTasks.map((t) => renderKanbanCard(t, 'inProgress'))
          )}
        </div>
      </div>

      {/* Column 3: Completed */}
      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/40">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Đã hoàn thành
            </h3>
            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-2xs font-bold rounded-full">
              {completedTasks.length}
            </span>
          </div>
        </div>

        <div className="space-y-3 min-h-[250px]">
          {completedTasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-emerald-200 dark:border-emerald-900/40 rounded-xl">
              Chưa có việc hoàn thành
            </div>
          ) : (
            completedTasks.map((t) => renderKanbanCard(t, 'done'))
          )}
        </div>
      </div>
    </div>
  );
};
