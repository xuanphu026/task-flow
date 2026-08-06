import React from 'react';
import {
  CheckSquare,
  List,
  Kanban,
  Calendar,
  BarChart3,
  Search,
  Menu,
  Sun,
  Moon,
  Plus,
  X,
  RotateCcw,
} from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onOpenQuickAdd: () => void;
  onToggleMobileSidebar: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  isDarkMode,
  toggleDarkMode,
  onOpenQuickAdd,
  onToggleMobileSidebar,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
              title="Mở danh mục"
              id="mobile-sidebar-toggle-btn"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  TaskFlow
                  <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    Cá Nhân
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-2 hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm công việc, thẻ, nội dung..."
                className="w-full pl-10 pr-9 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                id="header-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* View Modes Switcher */}
          <div className="hidden md:flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              id="view-mode-list-btn"
            >
              <List className="w-3.5 h-3.5" />
              Danh sách
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              id="view-mode-kanban-btn"
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban
            </button>

            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              id="view-mode-calendar-btn"
            >
              <Calendar className="w-3.5 h-3.5" />
              Lịch
            </button>

            <button
              onClick={() => setViewMode('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'analytics'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              id="view-mode-analytics-btn"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Thống kê
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onResetData}
              title="Khôi phục dữ liệu mẫu"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block"
              id="reset-sample-data-btn"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
              id="theme-toggle-btn"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm shadow-blue-500/25 transition-all transform active:scale-95"
              id="add-task-header-btn"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Tạo việc mới</span>
            </button>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800/60 overflow-x-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1 text-xs py-1 px-2.5 rounded-lg font-medium whitespace-nowrap ${
              viewMode === 'list'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Danh sách
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1 text-xs py-1 px-2.5 rounded-lg font-medium whitespace-nowrap ${
              viewMode === 'kanban'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" /> Kanban
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1 text-xs py-1 px-2.5 rounded-lg font-medium whitespace-nowrap ${
              viewMode === 'calendar'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Lịch
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`flex items-center gap-1 text-xs py-1 px-2.5 rounded-lg font-medium whitespace-nowrap ${
              viewMode === 'analytics'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Thống kê
          </button>
        </div>
      </div>
    </header>
  );
};
