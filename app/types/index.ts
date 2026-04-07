export type TicketStatus = 'todo' | 'in-progress' | 'in-review' | 'done';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  projectId: string;
  createdAt: number;
  dueDate: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; dot: string }> = {
  todo: { label: 'To Do', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400', dot: 'bg-slate-400' },
  'in-progress': { label: 'In Progress', color: 'bg-[#c2e7ff]/20 text-[#1a3a4a] dark:bg-[#c2e7ff]/10 dark:text-[#c2e7ff]', dot: 'bg-[#1a3a4a]' },
  'in-review': { label: 'In Review', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
  done: { label: 'Done', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
};

export const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; icon: string }> = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400', icon: '↓' },
  medium: { label: 'Medium', color: 'bg-[#c2e7ff]/20 text-[#1a3a4a] dark:bg-[#c2e7ff]/10 dark:text-[#c2e7ff]', icon: '→' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: '↑' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '⚡' },
};

export const STATUS_ORDER: TicketStatus[] = ['todo', 'in-progress', 'in-review', 'done'];

export const PRIORITY_ORDER: TicketPriority[] = ['low', 'medium', 'high', 'critical'];

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com' },
  { id: '4', name: 'Diana Prince', email: 'diana@example.com' },
  { id: '5', name: 'Eve Wilson', email: 'eve@example.com' },
];
