import React, { useState } from 'react';
import {
  Plus,
  Calendar as CalendarIcon,
  Flag,
  Tag,
  ListPlus,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { CategoryId, Priority, Task } from '../types';
import { CATEGORIES, PRIORITY_CONFIG } from '../data/categories';
import { DatePickerInput } from './DatePickerInput';

interface QuickTaskInputProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  isOpenModalMode?: boolean;
  onCloseModal?: () => void;
}

export const QuickTaskInput: React.FC<QuickTaskInputProps> = ({
  onAddTask,
  isOpenModalMode = false,
  onCloseModal,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryId>('work');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [isStarred, setIsStarred] = useState(false);
  const [isExpanded, setIsExpanded] = useState(isOpenModalMode);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = () => {
    if (subtaskTitle.trim()) {
      setSubtasks([
        ...subtasks,
        { id: `sub-${Date.now()}-${Math.random()}`, title: subtaskTitle.trim(), completed: false },
      ]);
      setSubtaskTitle('');
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      completed: false,
      priority,
      category,
      dueDate,
      subtasks,
      tags,
      isStarred,
      estimatedMinutes,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setSubtasks([]);
    setTags([]);
    setIsExpanded(isOpenModalMode);
    if (onCloseModal) onCloseModal();
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title Input */}
      <div className="relative">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Bạn muốn thực hiện công việc gì hôm nay?..."
          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xs transition-all"
          autoFocus={isOpenModalMode}
          id="quick-task-title-input"
        />
      </div>

      {/* Expanded controls */}
      {(isExpanded || isOpenModalMode || title.length > 0) && (
        <div className="space-y-4 pt-1 animate-fadeIn">
          {/* Description */}
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Thêm mô tả chi tiết hoặc ghi chú (không bắt buộc)..."
              rows={2}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none transition-all"
              id="quick-task-description-input"
            />
          </div>

          {/* Row 1: Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category Select */}
            <div>
              <label className="block text-2xs font-semibold text-slate-500 dark:text-slate-400 mb-1 whitespace-nowrap overflow-hidden text-ellipsis uppercase tracking-wider">
                Danh mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all cursor-pointer"
                id="quick-task-category-select"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Select */}
            <div>
              <label className="block text-2xs font-semibold text-slate-500 dark:text-slate-400 mb-1 whitespace-nowrap overflow-hidden text-ellipsis uppercase tracking-wider">
                Mức ưu tiên
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all cursor-pointer"
                id="quick-task-priority-select"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Due Date */}
            <DatePickerInput
              label="Hạn hoàn thành"
              value={dueDate}
              onChange={(val) => setDueDate(val)}
              showPresets={true}
              id="quick-task-duedate-input"
            />

            {/* Estimated Minutes */}
            <div>
              <label className="block text-2xs font-semibold text-slate-500 dark:text-slate-400 mb-1 whitespace-nowrap overflow-hidden text-ellipsis uppercase tracking-wider">
                Ước tính (Phút)
              </label>
              <input
                type="number"
                min={5}
                max={480}
                step={5}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full h-10 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                id="quick-task-est-input"
              />
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ListPlus className="w-3.5 h-3.5 text-blue-500" />
                Công việc con (Subtasks)
              </span>
              <span className="text-2xs text-slate-400">{subtasks.length} bước</span>
            </div>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Nhập tên bước nhỏ rồi nhấn Enter..."
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                id="quick-subtask-input"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors"
                id="add-subtask-btn"
              >
                Thêm
              </button>
            </div>

            {subtasks.length > 0 && (
              <ul className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                {subtasks.map((st) => (
                  <li
                    key={st.id}
                    className="flex items-center justify-between px-2.5 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <span>• {st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tags Section */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Thêm thẻ (Enter)..."
                className="w-32 px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
                id="quick-tag-input"
              />
            </div>

            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs border border-blue-200 dark:border-blue-800"
              >
                #{t}
                <button type="button" onClick={() => handleRemoveTag(t)}>
                  <X className="w-3 h-3 hover:text-rose-500" />
                </button>
              </span>
            ))}

            <button
              type="button"
              onClick={() => setIsStarred(!isStarred)}
              className={`ml-auto px-2.5 py-1 text-xs rounded-lg border flex items-center gap-1 transition-colors ${
                isStarred
                  ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {isStarred ? 'Đã đánh dấu sao' : 'Đánh dấu quan trọng'}
            </button>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-between pt-2">
        {!isOpenModalMode && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" /> Thu gọn
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> Chi tiết hơn
              </>
            )}
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {isOpenModalMode && (
            <button
              type="button"
              onClick={onCloseModal}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Hủy
            </button>
          )}

          <button
            type="submit"
            disabled={!title.trim()}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center gap-1.5"
            id="quick-task-submit-btn"
          >
            <Plus className="w-4 h-4" />
            Tạo công việc
          </button>
        </div>
      </div>
    </form>
  );

  if (isOpenModalMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Thêm công việc mới
            </h2>
            <button
              onClick={onCloseModal}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800/80 mb-6 transition-all">
      {content}
    </div>
  );
};
