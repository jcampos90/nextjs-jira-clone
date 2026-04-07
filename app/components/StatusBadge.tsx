import { TicketStatus, STATUS_CONFIG } from '@/app/types';

export default function StatusBadge({ status }: { status: TicketStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
