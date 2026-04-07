'use client';

import { memo, useMemo } from 'react';
import { Ticket, MOCK_USERS } from '@/app/types';
import { useJira } from '@/app/context/JiraContext';
import { formatDateShort } from '@/app/types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

function TicketCardComponent({ ticket, onClick }: TicketCardProps) {
  const { projects } = useJira();
  
  const { assignee, project, isOverdue } = useMemo(() => {
    const assignee = MOCK_USERS.find((u) => u.id === ticket.assignee);
    const project = projects.find((p) => p.id === ticket.projectId);
    const isOverdue = ticket.dueDate && new Date(ticket.dueDate) < new Date();
    return { assignee, project, isOverdue };
  }, [ticket.assignee, ticket.projectId, ticket.dueDate, projects]);

  return (
    <div
      onClick={onClick}
      className="card p-5 cursor-pointer group animate-slide-up"
    >
      {project && (
        <div className="text-xs font-medium text-[#1a3a4a] mb-2 flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          {project.name}
        </div>
      )}
      
      <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-[#1a3a4a] transition-colors">
        {ticket.title}
      </h3>
      
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
        {ticket.description || 'No description'}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <StatusBadge status={ticket.status} />
        <PriorityBadge priority={ticket.priority} />
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-500">
            {assignee?.name?.charAt(0) || '?'}
          </div>
          <span className="text-xs text-slate-500">
            {assignee?.name || 'Unassigned'}
          </span>
        </div>
        {ticket.dueDate && (
          <div className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDateShort(ticket.dueDate)}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(TicketCardComponent);