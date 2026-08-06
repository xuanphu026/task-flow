import { Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'work',
    label: 'Công việc',
    color: '#3b82f6',
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    textColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-500/30',
    iconName: 'Briefcase',
  },
  {
    id: 'personal',
    label: 'Cá nhân',
    color: '#8b5cf6',
    bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
    textColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-500/30',
    iconName: 'User',
  },
  {
    id: 'study',
    label: 'Học tập',
    color: '#10b981',
    bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500/30',
    iconName: 'BookOpen',
  },
  {
    id: 'health',
    label: 'Sức khỏe',
    color: '#f43f5e',
    bgColor: 'bg-rose-500/10 dark:bg-rose-500/20',
    textColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-500/30',
    iconName: 'HeartPulse',
  },
  {
    id: 'finance',
    label: 'Tài chính',
    color: '#f59e0b',
    bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500/30',
    iconName: 'Wallet',
  },
  {
    id: 'other',
    label: 'Khác',
    color: '#6b7280',
    bgColor: 'bg-slate-500/10 dark:bg-slate-500/20',
    textColor: 'text-slate-600 dark:text-slate-400',
    borderColor: 'border-slate-500/30',
    iconName: 'Tag',
  },
];

export const PRIORITY_CONFIG = {
  low: {
    label: 'Thấp',
    color: 'text-slate-500 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  },
  medium: {
    label: 'Trung bình',
    color: 'text-blue-500 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  high: {
    label: 'Cao',
    color: 'text-amber-500 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  urgent: {
    label: 'Khẩn cấp',
    color: 'text-rose-500 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse',
  },
};
