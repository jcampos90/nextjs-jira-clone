'use client';

import { TicketStatus, TicketPriority, STATUS_ORDER } from '@/app/types';
import { useJira } from '@/app/context/JiraContext';

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
  const { selectedProjectId, projectMembers } = useJira();
  const members = projectMembers[selectedProjectId] || [];

  return (
    <div className="flex items-center gap-2 p-2 bg-white dark:bg-[#242424] rounded-sm border border-[#E8E4DD] dark:border-[#3D3D3D]">
      <div className="relative flex-shrink-0 w-48">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B8680]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-8 pr-3 py-1.5 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-[#8B8680] text-[#1A1A1A] dark:text-[#E8E6E3]"
        />
      </div>
      
      <div className="w-px h-4 bg-[#E8E4DD] dark:bg-[#3D3D3D]" />
      
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value as TicketStatus | '' })}
        className="py-1.5 px-2 text-xs bg-transparent border-0 focus:outline-none cursor-pointer text-[#8B8680] hover:text-[#1A1A1A] dark:hover:text-[#E8E6E3]"
      >
        <option value="">Status</option>
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {s === 'todo' ? 'To Do' : s === 'in-progress' ? 'In Progress' : s === 'in-review' ? 'In Review' : 'Done'}
          </option>
        ))}
      </select>
      
      <select
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value as TicketPriority | '' })}
        className="py-1.5 px-2 text-xs bg-transparent border-0 focus:outline-none cursor-pointer text-[#8B8680] hover:text-[#1A1A1A] dark:hover:text-[#E8E6E3]"
      >
        <option value="">Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
      
      <select
        value={filters.assignee}
        onChange={(e) => onChange({ ...filters, assignee: e.target.value })}
        className="py-1.5 px-2 text-xs bg-transparent border-0 focus:outline-none cursor-pointer text-[#8B8680] hover:text-[#1A1A1A] dark:hover:text-[#E8E6E3]"
      >
        <option value="">Assignee</option>
        {members.map((user) => (
          <option key={user.id} value={user.email}>
            {user.name || user.email}
          </option>
        ))}
      </select>
      
      <div className="w-px h-4 bg-[#E8E4DD] dark:bg-[#3D3D3D]" />
      
      <select
        value={filters.sortBy}
        onChange={(e) => onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
        className="py-1.5 px-2 text-xs bg-transparent border-0 focus:outline-none cursor-pointer text-[#8B8680] hover:text-[#1A1A1A] dark:hover:text-[#E8E6E3]"
      >
        <option value="createdAt">Created</option>
        <option value="dueDate">Due Date</option>
        <option value="priority">Priority</option>
      </select>
      
      <button
        onClick={() => onChange({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
        className="p-1.5 text-[#8B8680] hover:text-[#C4A35A] transition-colors"
        title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
      >
        {filters.sortOrder === 'asc' ? (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
          </svg>
        )}
      </button>

      {(filters.search || filters.status || filters.priority || filters.assignee) && (
        <>
          <div className="w-px h-4 bg-[#E8E4DD] dark:bg-[#3D3D3D]" />
          <button
            onClick={() => onChange({ ...filters, search: '', status: '', priority: '', assignee: '' })}
            className="px-2 py-1 text-xs text-[#8B8680] hover:text-[#D64545] transition-colors"
          >
            Clear
          </button>
        </>
      )}
    </div>
  );
}