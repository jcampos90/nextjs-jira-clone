'use client';

import { Ticket, MOCK_USERS, STATUS_ORDER } from '@/app/types';
import { useJira } from '@/app/context/JiraContext';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

interface TicketDetailProps {
  ticket: Ticket;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TicketDetail({ ticket, onClose, onEdit, onDelete }: TicketDetailProps) {
  const { projects, moveTicket } = useJira();
  const assignee = MOCK_USERS.find((u) => u.id === ticket.assignee);
  const project = projects.find((p) => p.id === ticket.projectId);

  const currentIndex = STATUS_ORDER.indexOf(ticket.status);
  const canMoveForward = currentIndex < STATUS_ORDER.length - 1;
  const canMoveBackward = currentIndex > 0;

  const handleMove = (direction: 'forward' | 'backward') => {
    if (direction === 'forward' && canMoveForward) {
      moveTicket(ticket.id, STATUS_ORDER[currentIndex + 1]);
    } else if (direction === 'backward' && canMoveBackward) {
      moveTicket(ticket.id, STATUS_ORDER[currentIndex - 1]);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-[#E8E4DD] dark:border-[#3D3D3D]">
          <div className="flex items-center gap-3">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-[#8B8680] hover:text-[#1A1A1A] dark:hover:text-[#E8E6E3] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-display font-semibold text-[#1A1A1A] dark:text-[#E8E6E3] mb-6">
            {ticket.title}
          </h2>
          
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => handleMove('backward')}
              disabled={!canMoveBackward}
              className="px-4 py-2 text-sm border border-[#E8E4DD] dark:border-[#3D3D3D] rounded-sm hover:bg-[#E8E4DD] dark:hover:bg-[#3D3D3D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => handleMove('forward')}
              disabled={!canMoveForward}
              className="px-4 py-2 text-sm btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-medium text-[#8B8680] uppercase tracking-wider mb-2">Description</h3>
              <p className="text-[#2D2D2D] dark:text-[#E8E6E3] leading-relaxed whitespace-pre-wrap">
                {ticket.description || 'No description provided'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-medium text-[#8B8680] uppercase tracking-wider mb-2">Project</h3>
                <p className="text-[#2D2D2D] dark:text-[#E8E6E3] font-medium flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#C4A35A]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  {project?.name || 'Unknown'}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-[#8B8680] uppercase tracking-wider mb-2">Assignee</h3>
                <p className="text-[#2D2D2D] dark:text-[#E8E6E3]">
                  {assignee?.name || 'Unassigned'}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-[#8B8680] uppercase tracking-wider mb-2">Due Date</h3>
                <p className="text-[#2D2D2D] dark:text-[#E8E6E3] flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#8B8680]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {ticket.dueDate 
                    ? new Date(ticket.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : 'Not set'}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-[#8B8680] uppercase tracking-wider mb-2">Created</h3>
                <p className="text-[#2D2D2D] dark:text-[#E8E6E3]">
                  {formatDate(ticket.createdAt)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-[#E8E4DD] dark:border-[#3D3D3D]">
            <button
              onClick={onDelete}
              className="px-4 py-2 text-[#D64545] hover:bg-[#D64545]/10 rounded-sm transition-colors"
            >
              Delete Task
            </button>
            <button
              onClick={onEdit}
              className="btn-primary"
            >
              Edit Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}