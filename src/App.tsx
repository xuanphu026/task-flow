import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  calculateStats,
} from './utils/storage';
import {
  subscribeToTasks,
  saveTaskToFirestore,
  deleteTaskFromFirestore,
  resetToInitialTasksInFirestore,
} from './lib/firebase';
import {
  Task,
  ViewMode,
  TaskFilterState,
  SortOption,
  Priority,
  CategoryId,
} from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { QuickTaskInput } from './components/QuickTaskInput';
import { TaskCard } from './components/TaskCard';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TagManagerModal } from './components/TagManagerModal';
import { ConfirmModal } from './components/ConfirmModal';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { StatsOverview } from './components/StatsOverview';
import {
  CheckCircle2,
  Inbox,
  Sparkles,
  ArrowUpDown,
  Filter,
  Plus,
  Cloud,
} from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('taskflow_theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToTasks(
      (updatedTasks) => {
        // Auto-fix tasks where 100% of subtasks are completed but task.completed is false
        const tasksWithUpdates = updatedTasks.map((t) => {
          if (
            !t.completed &&
            t.subtasks &&
            t.subtasks.length > 0 &&
            t.subtasks.every((st) => st.completed)
          ) {
            const autoCompletedTask = {
              ...t,
              completed: true,
              completedAt: t.completedAt || new Date().toISOString(),
            };
            saveTaskToFirestore(autoCompletedTask).catch((err) =>
              console.error('Error auto-completing task in Firestore:', err)
            );
            return autoCompletedTask;
          }
          return t;
        });

        setTasks(tasksWithUpdates);
        setIsLoading(false);
      },
      (error) => {
        console.error('Firestore subscription error:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filters State
  const [filters, setFilters] = useState<TaskFilterState>({
    status: 'all',
    category: 'all',
    priority: 'all',
    searchQuery: '',
    tag: 'all',
    sortBy: 'dueDate',
    sortOrder: 'asc',
  });

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('taskflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('taskflow_theme', 'light');
    }
  }, [isDarkMode]);

  // Calculate statistics
  const stats = useMemo(() => calculateStats(tasks), [tasks]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => t.tags?.forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [tasks]);

  // Task actions with Firebase Firestore
  const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    const allDone =
      newTaskData.subtasks &&
      newTaskData.subtasks.length > 0 &&
      newTaskData.subtasks.every((st) => st.completed);

    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      completed: allDone ? true : newTaskData.completed,
      completedAt: allDone ? new Date().toISOString() : newTaskData.completedAt,
    };
    try {
      await saveTaskToFirestore(newTask);
    } catch (err) {
      console.error('Error adding task to Firestore:', err);
    }
  };

  const handleToggleComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nextState = !task.completed;

    let updatedSubtasks = task.subtasks;
    if (updatedSubtasks && updatedSubtasks.length > 0) {
      if (nextState) {
        updatedSubtasks = updatedSubtasks.map((st) => ({ ...st, completed: true }));
      } else if (updatedSubtasks.every((st) => st.completed)) {
        updatedSubtasks = updatedSubtasks.map((st) => ({ ...st, completed: false }));
      }
    }

    const updatedTask: Task = {
      ...task,
      completed: nextState,
      completedAt: nextState ? new Date().toISOString() : undefined,
      subtasks: updatedSubtasks,
    };

    if (nextState) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }

    try {
      await saveTaskToFirestore(updatedTask);
    } catch (err) {
      console.error('Error toggling complete:', err);
    }
  };

  const handleToggleStar = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updatedTask: Task = {
      ...task,
      isStarred: !task.isStarred,
    };
    try {
      await saveTaskToFirestore(updatedTask);
    } catch (err) {
      console.error('Error toggling star:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTaskFromFirestore(id);
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    let finalTask = { ...updatedTask };
    if (finalTask.subtasks && finalTask.subtasks.length > 0) {
      const allSubtasksDone = finalTask.subtasks.every((s) => s.completed);
      if (allSubtasksDone && !finalTask.completed) {
        finalTask.completed = true;
        finalTask.completedAt = finalTask.completedAt || new Date().toISOString();
      }
    }
    try {
      await saveTaskToFirestore(finalTask);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleMoveTaskStatus = async (
    taskId: string,
    targetColumn: 'todo' | 'inProgress' | 'done'
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    let updatedTask: Task = { ...task };
    if (targetColumn === 'done') {
      updatedTask = { ...task, completed: true, completedAt: new Date().toISOString() };
    } else if (targetColumn === 'inProgress') {
      const existingSubtasks = task.subtasks && task.subtasks.length > 0 ? task.subtasks : [
        { id: `sub-auto-1`, title: 'Bước đầu tiên', completed: true },
        { id: `sub-auto-2`, title: 'Bước hoàn thiện', completed: false }
      ];
      updatedTask = {
        ...task,
        completed: false,
        subtasks: existingSubtasks.map((s, idx) => (idx === 0 ? { ...s, completed: true } : s)),
      };
    } else {
      updatedTask = {
        ...task,
        completed: false,
        subtasks: task.subtasks ? task.subtasks.map((s) => ({ ...s, completed: false })) : [],
      };
    }

    try {
      await saveTaskToFirestore(updatedTask);
    } catch (err) {
      console.error('Error moving task status:', err);
    }
  };

  const handleDeleteTagGlobally = async (tagToDelete: string) => {
    setFilters((prev) => (prev.tag === tagToDelete ? { ...prev, tag: 'all' } : prev));

    const affectedTasks = tasks.filter((t) => t.tags?.includes(tagToDelete));
    for (const task of affectedTasks) {
      const updatedTags = (task.tags || []).filter((t) => t !== tagToDelete);
      const updatedTask: Task = { ...task, tags: updatedTags };
      try {
        await saveTaskToFirestore(updatedTask);
      } catch (err) {
        console.error('Error removing tag from task:', err);
      }
    }
  };

  const handleRenameTagGlobally = async (oldTag: string, newTag: string) => {
    setFilters((prev) => (prev.tag === oldTag ? { ...prev, tag: newTag } : prev));

    const affectedTasks = tasks.filter((t) => t.tags?.includes(oldTag));
    for (const task of affectedTasks) {
      const updatedTags = (task.tags || []).map((t) => (t === oldTag ? newTag : t));
      const uniqueTags = Array.from(new Set(updatedTags));
      const updatedTask: Task = { ...task, tags: uniqueTags };
      try {
        await saveTaskToFirestore(updatedTask);
      } catch (err) {
        console.error('Error renaming tag in task:', err);
      }
    }
  };

  const handleResetData = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = async () => {
    try {
      await resetToInitialTasksInFirestore();
    } catch (err) {
      console.error('Error resetting data:', err);
    }
  };

  // Filter & Sort tasks
  const filteredTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return tasks.filter((task) => {
      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesTag = task.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTag) return false;
      }

      // Status filter
      if (filters.status === 'today' && task.dueDate !== todayStr) return false;
      if (filters.status === 'starred' && !task.isStarred) return false;
      if (filters.status === 'upcoming' && (task.completed || task.dueDate <= todayStr)) return false;
      if (filters.status === 'overdue' && (task.completed || !task.dueDate || task.dueDate >= todayStr)) return false;
      if (filters.status === 'completed' && !task.completed) return false;
      if (filters.status === 'active' && task.completed) return false;

      // Category filter
      if (filters.category !== 'all' && task.category !== filters.category) return false;

      // Priority filter
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;

      // Tag filter
      if (filters.tag !== 'all' && !task.tags?.includes(filters.tag)) return false;

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (filters.sortBy === 'dueDate') {
        comparison = (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
      } else if (filters.sortBy === 'priority') {
        const priorityOrder: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (filters.sortBy === 'createdAt') {
        comparison = b.createdAt.localeCompare(a.createdAt);
      } else if (filters.sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [tasks, filters]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Header */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={filters.searchQuery}
        setSearchQuery={(query) => setFilters((prev) => ({ ...prev, searchQuery: query }))}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenQuickAdd={() => setIsQuickAddModalOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <Sidebar
          tasks={tasks}
          filters={filters}
          setFilters={setFilters}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          allTags={allTags}
          onOpenQuickAdd={() => setIsQuickAddModalOpen(true)}
          onOpenTagManager={() => setIsTagManagerOpen(true)}
          onDeleteTagGlobally={handleDeleteTagGlobally}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* List View */}
          {viewMode === 'list' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Quick Task Creation Card */}
              <QuickTaskInput onAddTask={handleAddTask} />

              {/* Stats Overview Bar */}
              <StatsOverview stats={stats} />

              {/* Controls: Header, Sorting, Filter Info */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {filters.status === 'all' && 'Tất cả công việc'}
                    {filters.status === 'today' && 'Công việc hôm nay'}
                    {filters.status === 'starred' && 'Công việc quan trọng ⭐'}
                    {filters.status === 'upcoming' && 'Công việc sắp tới'}
                    {filters.status === 'overdue' && 'Công việc quá hạn ⚠️'}
                    {filters.status === 'completed' && 'Công việc đã hoàn thành'}
                    {filters.status === 'active' && 'Công việc đang chờ'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredTasks.length}
                  </span>
                </div>

                {/* Sort Option */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5" /> Sắp xếp:
                  </span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, sortBy: e.target.value as SortOption }))
                    }
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
                    id="sort-by-select"
                  >
                    <option value="dueDate">Hạn hoàn thành</option>
                    <option value="priority">Mức ưu tiên</option>
                    <option value="createdAt">Mới tạo nhất</option>
                    <option value="title">Tên công việc</option>
                  </select>
                </div>
              </div>

              {/* Tasks List */}
              {filteredTasks.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-500 mx-auto flex items-center justify-center mb-4">
                    <Inbox className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    Không tìm thấy công việc phù hợp
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
                    Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc danh mục hiện tại.
                  </p>
                  <button
                    onClick={() => setIsQuickAddModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    Thêm công việc ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onToggleStar={handleToggleStar}
                      onDelete={handleDeleteTask}
                      onSelectTask={(t) => setSelectedTask(t)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Kanban View */}
          {viewMode === 'kanban' && (
            <KanbanBoard
              tasks={filteredTasks}
              onToggleComplete={handleToggleComplete}
              onToggleStar={handleToggleStar}
              onSelectTask={(t) => setSelectedTask(t)}
              onOpenQuickAdd={() => setIsQuickAddModalOpen(true)}
              onMoveTaskStatus={handleMoveTaskStatus}
            />
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <CalendarView
              tasks={tasks}
              onSelectTask={(t) => setSelectedTask(t)}
            />
          )}

          {/* Analytics View */}
          {viewMode === 'analytics' && (
            <AnalyticsView stats={stats} tasks={tasks} />
          )}
        </main>
      </div>

      {/* Quick Add Modal */}
      {isQuickAddModalOpen && (
        <QuickTaskInput
          onAddTask={handleAddTask}
          isOpenModalMode={true}
          onCloseModal={() => setIsQuickAddModalOpen(false)}
        />
      )}

      {/* Task Detail & Editor Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {/* Tag Manager Modal */}
      <TagManagerModal
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
        allTags={allTags}
        tasks={tasks}
        onDeleteTagGlobally={handleDeleteTagGlobally}
        onRenameTagGlobally={handleRenameTagGlobally}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Khôi phục dữ liệu mẫu"
        message="Bạn có chắc chắn muốn khôi phục lại danh sách công việc mẫu ban đầu không? Dữ liệu hiện tại sẽ được cập nhật lại."
        confirmText="Khôi phục"
        cancelText="Hủy"
        isDanger={false}
      />
    </div>
  );
}
