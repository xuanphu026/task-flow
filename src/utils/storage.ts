import { Task, ProductivityStats } from '../types';
import { INITIAL_TASKS } from '../data/initialTasks';

const STORAGE_KEY = 'taskflow_tasks_v1';

export const loadTasksFromStorage = (): Task[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : INITIAL_TASKS;
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
    return INITIAL_TASKS;
  }
};

export const saveTasksToStorage = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
  }
};

export const calculateStats = (tasks: Task[]): ProductivityStats => {
  const todayStr = new Date().toISOString().split('T')[0];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const activeTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < todayStr
  ).length;
  const starredTasks = tasks.filter((t) => t.isStarred).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    activeTasks,
    overdueTasks,
    completionRate,
    starredTasks,
    streakDays: 5, // Active streak counter
  };
};

export const isSameDay = (date1: string, date2: string): boolean => {
  if (!date1 || !date2) return false;
  return date1.substring(0, 10) === date2.substring(0, 10);
};

export const formatVietnameseDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const todayStr = new Date().toISOString().split('T')[0];
  
  const tom = new Date();
  tom.setDate(tom.getDate() + 1);
  const tomStr = tom.toISOString().split('T')[0];

  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const yestStr = yest.toISOString().split('T')[0];

  if (dateStr === todayStr) return 'Hôm nay';
  if (dateStr === tomStr) return 'Ngày mai';
  if (dateStr === yestStr) return 'Hôm qua';

  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
};
