import React, { useState } from 'react';
import {
  X,
  Check,
  Trash2,
  Calendar,
  Clock,
  Plus,
  Tag,
  Star,
  CheckSquare,
  Sparkles,
  Save,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CategoryId, Priority, Task } from '../types';
import { CATEGORIES, PRIORITY_CONFIG } from '../data/categories';
import { DatePickerInput } from './DatePickerInput';
import { ConfirmModal } from './ConfirmModal';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdateTask: (updated: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onUpdateTask,
  onDeleteTask,
}) => {
  if (!task) return null;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [category, setCategory] = useState<CategoryId>(task.category);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [isStarred, setIsStarred] = useState(!!task.isStarred);
  const [isCompleted, setIsCompleted] = useState(
    task.completed || (task.subtasks && task.subtasks.length > 0 && task.subtasks.every((s) => s.completed))
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState(task.estimatedMinutes || 30);
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [tags, setTags] = useState(task.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    setSubtasks(updatedSubtasks);

    // Auto update task if all subtasks completed
    const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.completed);
    if (allDone) {
      setIsCompleted(true);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } else if (isCompleted && updatedSubtasks.length > 0 && !allDone) {
      setIsCompleted(false);
    }
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const updated = [
        ...subtasks,
        { id: `sub-${Date.now()}-${Math.random()}`, title: newSubtaskTitle.trim(), completed: false },
      ];
      setSubtasks(updated);
      setNewSubtaskTitle('');
      // Adding an incomplete subtask means subtasks are no longer 100%
      if (isCompleted) {
        setIsCompleted(false);
      }
    }
  };

  const handleRemoveSubtask = (subtaskId: string) => {
    const updated = subtasks.filter((st) => st.id !== subtaskId);
    setSubtasks(updated);
    if (updated.length > 0 && updated.every((s) => s.completed)) {
      setIsCompleted(true);
    }
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = () => {
    const allDone = subtasks.length > 0 && subtasks.every((s) => s.completed);
    const finalCompleted = allDone ? true : isCompleted;

    onUpdateTask({
      ...task,
      title: title.trim() || task.title,
      description: description.trim(),
      category,
      priority,
      dueDate,
      isStarred,
      estimatedMinutes,
      subtasks,
      tags,
      completed: finalCompleted,
      completedAt: finalCompleted ? (task.completedAt || new Date().toISOString()) : undefined,
    });
    onClose();
  };

  const handleToggleCompleteMain = () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);

    let updatedSubtasks = subtasks;
    if (nextState) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      if (subtasks.length > 0) {
        updatedSubtasks = subtasks.map((s) => ({ ...s, completed: true }));
        setSubtasks(updatedSubtasks);
      }
    } else {
      if (subtasks.length > 0 && subtasks.every((s) => s.completed)) {
        updatedSubtasks = subtasks.map((s) => ({ ...s, completed: false }));
        setSubtasks(updatedSubtasks);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleCompleteMain}
              className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                isCompleted
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-white dark:bg-slate-800'
              }`}
              title={isCompleted ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
            >
              {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
            </button>

            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isCompleted ? 'Công việc đã hoàn thành' : 'Chi tiết công việc'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStarred(!isStarred)}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Đánh dấu quan trọng"
            >
              <Star className={`w-5 h-5 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
              title="Xóa công việc"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          {/* Title Edit Input */}
          <div>
            <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Tên công việc
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-lg font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              id="detail-title-input"
            />
          </div>

          {/* Row 1: Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                Danh mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                Mức ưu tiên
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
              >
                {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_CONFIG[p].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Due Date & Estimated Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <DatePickerInput
              label="Hạn hoàn thành"
              value={dueDate}
              onChange={(val) => setDueDate(val)}
              showPresets={true}
              id="detail-duedate-input"
            />

            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                Ước tính (Phút)
              </label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                min={0}
                step={5}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>

          {/* Description Edit */}
          <div>
            <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Ghi chú / Mô tả chi tiết
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Thêm mô tả cho công việc..."
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
            />
          </div>

          {/* Subtasks checklist */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-blue-500" />
                Các bước thực hiện ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
              </span>
            </div>

            <div className="space-y-2 mb-3">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/80"
                >
                  <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span
                      className={`text-sm ${
                        st.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {st.title}
                    </span>
                  </label>
                  <button
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new subtask row */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Thêm bước con mới..."
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thêm
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Thẻ nhãn
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800"
                >
                  #{t}
                  <button type="button" onClick={() => handleRemoveTag(t)} title="Xóa thẻ này">
                    <X className="w-3.5 h-3.5 hover:text-rose-500 transition-colors" />
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Nhập thẻ rồi Enter..."
                  className="w-32 px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-2xs text-slate-400">
            Tạo lúc: {new Date(task.createdAt).toLocaleDateString('vi-VN')}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors font-medium"
            >
              Đóng
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5"
              id="save-task-detail-btn"
            >
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={() => {
          onDeleteTask(task.id);
          onClose();
        }}
        title="Xóa công việc"
        message={`Bạn có chắc chắn muốn xóa công việc "${task.title}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        isDanger={true}
      />
    </div>
  );
};
