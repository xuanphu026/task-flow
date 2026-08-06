import React from 'react';
import {
  Inbox,
  Calendar,
  Star,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Briefcase,
  User,
  BookOpen,
  HeartPulse,
  Wallet,
  Tag,
  Filter,
  X,
  Plus,
} from 'lucide-react';
import { CategoryId, FilterStatus, Priority, Task, TaskFilterState } from '../types';
import { CATEGORIES, PRIORITY_CONFIG } from '../data/categories';

interface SidebarProps {
  tasks: Task[];
  filters: TaskFilterState;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilterState>>;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  allTags: string[];
  onOpenQuickAdd: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  tasks,
  filters,
  setFilters,
  isOpenMobile,
  onCloseMobile,
  allTags,
  onOpenQuickAdd,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Count calculations
  const counts = {
    all: tasks.length,
    today: tasks.filter((t) => t.dueDate === todayStr).length,
    starred: tasks.filter((t) => t.isStarred).length,
    upcoming: tasks.filter((t) => t.dueDate && t.dueDate > todayStr && !t.completed).length,
    overdue: tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr).length,
    completed: tasks.filter((t) => t.completed).length,
    active: tasks.filter((t) => !t.completed).length,
  };

  const getCategoryCount = (catId: CategoryId) => {
    return tasks.filter((t) => t.category === catId).length;
  };

  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase':
        return <Briefcase className="w-4 h-4" />;
      case 'User':
        return <User className="w-4 h-4" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4" />;
      case 'HeartPulse':
        return <HeartPulse className="w-4 h-4" />;
      case 'Wallet':
        return <Wallet className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const statusItems: { id: FilterStatus; label: string; icon: React.ReactNode; count: number; color?: string }[] = [
    { id: 'all', label: 'Tất cả công việc', icon: <Inbox className="w-4 h-4" />, count: counts.all },
    { id: 'today', label: 'Hôm nay', icon: <Calendar className="w-4 h-4 text-blue-500" />, count: counts.today },
    { id: 'starred', label: 'Quan trọng', icon: <Star className="w-4 h-4 text-amber-500 fill-amber-500" />, count: counts.starred },
    { id: 'upcoming', label: 'Sắp tới', icon: <Clock className="w-4 h-4 text-purple-500" />, count: counts.upcoming },
    { id: 'overdue', label: 'Quá hạn', icon: <AlertTriangle className="w-4 h-4 text-rose-500" />, count: counts.overdue, color: 'text-rose-600 font-medium' },
    { id: 'completed', label: 'Đã hoàn thành', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, count: counts.completed },
  ];

  const handleStatusChange = (status: FilterStatus) => {
    setFilters((prev) => ({ ...prev, status }));
    onCloseMobile();
  };

  const handleCategoryChange = (category: CategoryId | 'all') => {
    setFilters((prev) => ({ ...prev, category: prev.category === category ? 'all' : category }));
    onCloseMobile();
  };

  const handlePriorityChange = (priority: Priority | 'all') => {
    setFilters((prev) => ({ ...prev, priority: prev.priority === priority ? 'all' : priority }));
    onCloseMobile();
  };

  const handleTagChange = (tag: string) => {
    setFilters((prev) => ({ ...prev, tag: prev.tag === tag ? 'all' : tag }));
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full py-4 px-3 space-y-6 overflow-y-auto custom-scrollbar">
      {/* Quick Add CTA Button */}
      <button
        onClick={() => {
          onOpenQuickAdd();
          onCloseMobile();
        }}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all shadow-blue-500/20"
        id="sidebar-create-task-btn"
      >
        <Plus className="w-4 h-4" />
        Thêm Công Việc Mới
      </button>

      {/* Primary Status Filters */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
          Danh Mục Bộ Lọc
        </div>
        <nav className="space-y-0.5">
          {statusItems.map((item) => {
            const isActive = filters.status === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleStatusChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
                id={`filter-status-${item.id}`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span className={item.color || ''}>{item.label}</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Category Filter */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2 flex items-center justify-between">
          <span>Phân Loại</span>
          {filters.category !== 'all' && (
            <button
              onClick={() => handleCategoryChange('all')}
              className="text-2xs text-blue-600 dark:text-blue-400 hover:underline capitalize"
            >
              Bỏ lọc
            </button>
          )}
        </div>
        <div className="space-y-0.5">
          {CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat.id;
            const count = getCategoryCount(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold ring-1 ring-slate-300 dark:ring-slate-700'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
                id={`filter-category-${cat.id}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`p-1 rounded-lg ${cat.bgColor} ${cat.textColor}`}>
                    {renderCategoryIcon(cat.iconName)}
                  </span>
                  <span>{cat.label}</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Priority Filter */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2 flex items-center justify-between">
          <span>Ưu Tiên</span>
          {filters.priority !== 'all' && (
            <button
              onClick={() => handlePriorityChange('all')}
              className="text-2xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Bỏ lọc
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5 px-1">
          {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => {
            const conf = PRIORITY_CONFIG[p];
            const isSelected = filters.priority === p;
            return (
              <button
                key={p}
                onClick={() => handlePriorityChange(p)}
                className={`py-1.5 px-2 rounded-lg text-xs border text-center transition-all ${
                  isSelected
                    ? 'ring-2 ring-blue-500 border-transparent font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                id={`filter-priority-${p}`}
              >
                {conf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2 flex items-center justify-between">
            <span>Thẻ Nhãn</span>
            {filters.tag !== 'all' && (
              <button
                onClick={() => handleTagChange('all')}
                className="text-2xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Bỏ lọc
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 px-2">
            {allTags.map((tag) => {
              const isSelected = filters.tag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => handleTagChange(tag)}
                  className={`text-2xs px-2.5 py-1 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 font-medium'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  id={`filter-tag-${tag}`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reset all filters if any active */}
      {(filters.status !== 'all' || filters.category !== 'all' || filters.priority !== 'all' || filters.tag !== 'all' || filters.searchQuery !== '') && (
        <button
          onClick={() =>
            setFilters({
              status: 'all',
              category: 'all',
              priority: 'all',
              searchQuery: '',
              tag: 'all',
              sortBy: 'dueDate',
              sortOrder: 'asc',
            })
          }
          className="w-full mt-2 py-2 px-3 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-center justify-center gap-1.5 font-medium transition-colors"
          id="clear-all-filters-btn"
        >
          <Filter className="w-3.5 h-3.5" />
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 min-h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 shadow-xl flex flex-col z-10">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">Bộ lọc & Danh mục</span>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
