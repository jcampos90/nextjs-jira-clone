'use client';

import { useState, useMemo } from 'react';
import { useTickets } from '@/app/context/TicketContext';
import { Ticket, TicketStatus, STATUS_ORDER, STATUS_CONFIG } from '@/app/types';
import TicketCard from '@/app/components/TicketCard';
import TicketForm from '@/app/components/TicketForm';
import TicketDetail from '@/app/components/TicketDetail';
import FilterBar, { FilterState } from '@/app/components/FilterBar';
import ConfirmDialog from '@/app/components/ConfirmDialog';

export default function Home() {
  const { tickets, addTicket, updateTicket, deleteTicket } = useTickets();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    priority: '',
    assignee: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [deletingTicket, setDeletingTicket] = useState<Ticket | null>(null);

  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower)
      );
    }
    if (filters.status) {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }
    if (filters.assignee) {
      result = result.filter((t) => t.assignee === filters.assignee);
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (filters.sortBy === 'createdAt') {
        comparison = a.createdAt - b.createdAt;
      } else if (filters.sortBy === 'dueDate') {
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        comparison = aDate - bDate;
      } else if (filters.sortBy === 'priority') {
        const priorityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tickets, filters]);

  const getTicketsByStatus = (status: TicketStatus) =>
    filteredTickets.filter((t) => t.status === status);

  const handleSubmit = (data: Omit<Ticket, 'id' | 'createdAt'>) => {
    if (editingTicket) {
      updateTicket(editingTicket.id, data);
    } else {
      addTicket(data);
    }
    setShowForm(false);
    setEditingTicket(null);
  };

  const handleEdit = () => {
    if (selectedTicket) {
      setEditingTicket(selectedTicket);
      setSelectedTicket(null);
      setShowForm(true);
    }
  };

  const handleDelete = () => {
    if (deletingTicket) {
      deleteTicket(deletingTicket.id);
      setDeletingTicket(null);
    }
  };

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">JIRA Clone</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            + Create Ticket
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <FilterBar filters={filters} onChange={setFilters} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {STATUS_ORDER.map((status) => (
            <div key={status} className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {STATUS_CONFIG[status].label}
                </h2>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {getTicketsByStatus(status).length}
                </span>
              </div>
              <div className="flex-1 space-y-3 min-h-[200px]">
                {getTicketsByStatus(status).map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onClick={() => setSelectedTicket(ticket)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {showForm && (
        <TicketForm
          ticket={editingTicket}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingTicket(null);
          }}
        />
      )}

      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onEdit={handleEdit}
          onDelete={() => {
            setDeletingTicket(selectedTicket);
            setSelectedTicket(null);
          }}
        />
      )}

      {deletingTicket && (
        <ConfirmDialog
          title="Delete Ticket"
          message={`Are you sure you want to delete "${deletingTicket.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeletingTicket(null)}
        />
      )}
    </div>
  );
}