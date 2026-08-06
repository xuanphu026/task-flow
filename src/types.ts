export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type CategoryId = 'work' | 'personal' | 'study' | 'health' | 'finance' | 'other';

export interface Category {
  id: CategoryId;
  label: string;
  color: string; // Tailwind color class or hex code
  bgColor: string;
  textColor: string;
  borderColor: string;
  iconName: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category: CategoryId;
  dueDate: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
  subtasks: SubTask[];
  tags: string[];
  isStarred?: boolean;
  estimatedMinutes?: number;
}

export type ViewMode = 'list' | 'kanban' | 'calendar' | 'analytics';

export type FilterStatus = 'all' | 'today' | 'upcoming' | 'starred' | 'completed' | 'active' | 'overdue';

export type SortOption = 'dueDate' | 'priority' | 'createdAt' | 'title';

export interface TaskFilterState {
  status: FilterStatus;
  category: CategoryId | 'all';
  priority: Priority | 'all';
  searchQuery: string;
  tag: string | 'all';
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
}

export interface ProductivityStats {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  overdueTasks: number;
  completionRate: number;
  starredTasks: number;
  streakDays: number;
}
