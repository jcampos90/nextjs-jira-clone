'use client';

import { TicketStatus, TicketPriority, MOCK_USERS, STATUS_ORDER } from '@/app/types';

export type FilterState = {
  search: string;
  status: TicketStatus | '';
  priority: TicketPriority | '';
  assignee: string;
  sortBy: 'createdAt' | 'dueDate' | 'priority';
  sortOrder: 'asc' | 'desc';
};

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder="Search tickets..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value as TicketStatus | '' })}
        className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Statuses</option>
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {s === 'todo' ? 'To Do' : s === 'in-progress' ? 'In Progress' : s === 'in-review' ? 'In Review' : 'Done'}
          </option>
        ))}
      </select>
      <select
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value as TicketPriority | '' })}
        className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
      <select
        value={filters.assignee}
        onChange={(e) => onChange({ ...filters, assignee: e.target.value })}
        className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Assignees</option>
        {MOCK_USERS.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      <select
        value={filters.sortBy}
        onChange={(e) => onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
        className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="createdAt">Created Date</option>
        <option value="dueDate">Due Date</option>
        <option value="priority">Priority</option>
      </select>
      <button
        onClick={() => onChange({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
        className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700"
      >
        {filters.sortOrder === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  );
}