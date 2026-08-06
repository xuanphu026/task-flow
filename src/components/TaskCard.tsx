import React from 'react';
import {
  Check,
  Star,
  Clock,
  AlertCircle,
  Calendar,
  MoreVertical,
  CheckSquare,
  Edit2,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task } from '../types';
import { CATEGORIES, PRIORITY_CONFIG } from '../data/categories';
import { formatVietnameseDate } from '../utils/storage';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
  onSelectTask: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onToggleStar,
  onDelete,
  onSelectTask,
}) => {
  const categoryConfig = CATEGORIES.find((c) => c.id === task.category) || CATEGORIES[0];
  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;
  const isToday = task.dueDate === todayStr;

  const subtasksCount = task.subtasks?.length || 0;
  const subtasksCompleted = task.subtasks?.filter((s) => s.completed).length || 0;
  const subtaskProgress = subtasksCount > 0 ? Math.round((subtasksCompleted / subtasksCount) * 100) : 0;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      // Trigger festive confetti particle effect!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
    onToggleComplete(task.id);
  };

  return (
    <div
      onClick={() => onSelectTask(task)}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all duration-200 hover:shadow-md cursor-pointer ${
        task.completed
          ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 opacity-75'
          : isOverdue
          ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
      id={`task-card-${task.id}`}
    >
      <div className="flex items-start gap-3.5">
        {/* Custom Circular Checkbox */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          className={`shrink-0 mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-white dark:bg-slate-800'
          }`}
          title={task.completed ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
          id={`task-checkbox-${task.id}`}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Content Main Body */}
        <div className="flex-1 min-w-0">
          {/* Header row: Category chip, Priority badge, Star button */}
          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category chip */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-semibold ${categoryConfig.bgColor} ${categoryConfig.textColor}`}
              >
                {categoryConfig.label}
              </span>

              {/* Priority badge */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-semibold border ${priorityConfig.badgeClass}`}
              >
                {priorityConfig.label}
              </span>

              {/* Estimated time */}
              {task.estimatedMinutes && (
                <span className="inline-flex items-center gap-1 text-2xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {task.estimatedMinutes}p
                </span>
              )}
            </div>

            {/* Star toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(task.id);
              }}
              className="text-slate-300 hover:text-amber-400 dark:text-slate-600 dark:hover:text-amber-400 transition-colors p-1"
              id={`task-star-${task.id}`}
            >
              <Star
                className={`w-4 h-4 ${
                  task.isStarred ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
            </button>
          </div>

          {/* Title */}
          <h3
            className={`text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug mb-1 transition-all ${
              task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
            }`}
          >
            {task.title}
          </h3>

          {/* Description preview */}
          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
              {task.description}
            </p>
          )}

          {/* Subtask progress bar */}
          {subtasksCount > 0 && (
            <div className="mt-2 mb-2">
              <div className="flex items-center justify-between text-2xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-medium">
                  <CheckSquare className="w-3 h-3 text-blue-500" />
                  Công việc con ({subtasksCompleted}/{subtasksCount})
                </span>
                <span>{subtaskProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Bottom row: Due date badge, tags & actions */}
          <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            {/* Due date indicator */}
            <div
              className={`flex items-center gap-1 font-medium ${
                task.completed
                  ? 'text-slate-400'
                  : isOverdue
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : isToday
                  ? 'text-amber-600 dark:text-amber-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {isOverdue ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : (
                <Calendar className="w-3.5 h-3.5" />
              )}
              <span>{formatVietnameseDate(task.dueDate)}</span>
              {isOverdue && <span className="text-2xs uppercase tracking-wider">(Quá hạn)</span>}
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="hidden sm:flex items-center gap-1 overflow-hidden">
                {task.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-2xs px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action buttons (Visible on hover or mobile) */}
            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTask(task);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                title="Chỉnh sửa chi tiết"
                id={`task-edit-${task.id}`}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                title="Xóa công việc"
                id={`task-delete-${task.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
