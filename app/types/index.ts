export type TicketStatus = 'todo' | 'in-progress' | 'in-review' | 'done';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  createdAt: number;
  dueDate: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string }> = {
  todo: { label: 'To Do', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  'in-review': { label: 'In Review', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  done: { label: 'Done', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
};

export const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
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
