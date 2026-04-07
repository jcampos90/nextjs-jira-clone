import { Ticket, MOCK_USERS } from '@/app/types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

export default function TicketCard({ ticket, onClick }: TicketCardProps) {
  const assignee = MOCK_USERS.find((u) => u.id === ticket.assignee);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2">
        {ticket.title}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-2">
        {ticket.description}
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        <StatusBadge status={ticket.status} />
        <PriorityBadge priority={ticket.priority} />
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>{assignee?.name || 'Unassigned'}</span>
        {ticket.dueDate && (
          <span className={new Date(ticket.dueDate) < new Date() ? 'text-red-500' : ''}>
            Due: {formatDate(ticket.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}