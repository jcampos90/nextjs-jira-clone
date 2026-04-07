import { TicketPriority, PRIORITY_CONFIG } from '@/app/types';

export default function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
