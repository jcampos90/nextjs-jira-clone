'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useJira } from '@/app/context/JiraContext';
import UserMenu from '@/app/components/UserMenu';
import { Ticket, TicketStatus, STATUS_ORDER, STATUS_CONFIG } from '@/app/types';
import TicketCard from '@/app/components/TicketCard';
import FilterBar, { FilterState } from '@/app/components/FilterBar';
import ProjectList from '@/app/components/ProjectList';

const TicketForm = dynamic(() => import('@/app/components/TicketForm'), { ssr: false });
const TicketDetail = dynamic(() => import('@/app/components/TicketDetail'), { ssr: false });
const ConfirmDialog = dynamic(() => import('@/app/components/ConfirmDialog'), { ssr: false });
const ProjectForm = dynamic(() => import('@/app/components/ProjectForm'), { ssr: false });

export default function Home() {
  const { tickets, addTicket, updateTicket, deleteTicket, selectedProjectId, projects, addProject, updateProject } = useJira();
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
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  const projectTickets = useMemo(() => {
    return tickets.filter((t) => t.projectId === selectedProjectId);
  }, [tickets, selectedProjectId]);

  const filteredTickets = useMemo(() => {
    const result = projectTickets.filter((t) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!t.title.toLowerCase().includes(searchLower) && 
            !t.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      if (filters.status && t.status !== filters.status) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.assignee && t.assignee !== filters.assignee) return false;
      return true;
    });

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
  }, [projectTickets, filters]);

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

  const handleProjectSubmit = (data: { name: string; description: string }) => {
    if (editingProject) {
      updateProject(editingProject, data);
    } else {
      addProject(data);
    }
    setShowProjectForm(false);
    setEditingProject(null);
  };

  return (
    <div className="min-h-full flex">
      <ProjectList
        onSelectProject={() => {}}
        onCreateProject={() => setShowProjectForm(true)}
      />

      <div className="flex-1 flex flex-col min-h-full">
        <header className="bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-700 px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-display font-semibold text-slate-900 dark:text-slate-100">
                {currentProject?.name || 'Dashboard'}
              </h1>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </button>
              <p className="text-sm text-slate-500">
                {projectTickets.length} {projectTickets.length === 1 ? 'task' : 'tasks'} in this project
              </p>
            </div>
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 p-8 bg-[#f8fafc] dark:bg-[#0f172a]">
          <FilterBar filters={filters} onChange={setFilters} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {STATUS_ORDER.map((status, index) => (
              <div 
                key={status} 
                className="kanban-column animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="column-header mb-4">
                  <h2 className="font-display font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[status].dot}`} />
                    {STATUS_CONFIG[status].label}
                  </h2>
                  <span className="text-sm text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                    {getTicketsByStatus(status).length}
                  </span>
                </div>
                <div className="flex-1 space-y-4 min-h-[300px] pb-4">
                  {getTicketsByStatus(status).map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onClick={() => setSelectedTicket(ticket)}
                    />
                  ))}
                  {getTicketsByStatus(status).length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-700 rounded-sm">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

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
          title="Delete Task"
          message={`Are you sure you want to delete "${deletingTicket.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeletingTicket(null)}
        />
      )}

      {showProjectForm && (
        <ProjectForm
          project={editingProject ? { id: editingProject, name: '', description: '', createdAt: 0 } : null}
          onSubmit={handleProjectSubmit}
          onClose={() => {
            setShowProjectForm(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
}