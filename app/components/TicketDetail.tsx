'use client';

import { Ticket, MOCK_USERS, STATUS_ORDER } from '@/app/types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { useTickets } from '@/app/context/TicketContext';

interface TicketDetailProps {
  ticket: Ticket;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TicketDetail({ ticket, onClose, onEdit, onDelete }: TicketDetailProps) {
  const { moveTicket } = useTickets();
  const assignee = MOCK_USERS.find((u) => u.id === ticket.assignee);

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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">{ticket.title}</h2>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => handleMove('backward')}
              disabled={!canMoveBackward}
              className="px-3 py-1 text-sm bg-zinc-100 dark:bg-zinc-800 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={() => handleMove('forward')}
              disabled={!canMoveForward}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Description</h3>
              <p className="text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">{ticket.description || 'No description'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Assignee</h3>
                <p className="text-zinc-900 dark:text-zinc-100">{assignee?.name || 'Unassigned'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Due Date</h3>
                <p className="text-zinc-900 dark:text-zinc-100">
                  {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Created</h3>
                <p className="text-zinc-900 dark:text-zinc-100">{formatDate(ticket.createdAt)}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between gap-2 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <button
              onClick={onDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
            >
              Delete
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}