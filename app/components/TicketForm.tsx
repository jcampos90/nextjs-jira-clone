'use client';

import { useState } from 'react';
import { Ticket, TicketStatus, TicketPriority, STATUS_ORDER } from '@/app/types';
import { useJira } from '@/app/context/JiraContext';

interface TicketFormProps {
  ticket?: Ticket | null;
  onSubmit: (data: Omit<Ticket, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

function getInitialState(ticket: Ticket | null | undefined, members: { id: string; email: string }[]) {
  if (ticket) {
    const member = members.find(m => m.email === ticket.assignee);
    return {
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      assigneeId: member?.id || '',
      projectId: ticket.projectId,
      dueDate: ticket.dueDate || '',
    };
  }
  return {
    title: '',
    description: '',
    status: 'todo' as TicketStatus,
    priority: 'medium' as TicketPriority,
    assigneeId: '',
    projectId: '',
    dueDate: '',
  };
}

export default function TicketForm({ ticket, onSubmit, onClose }: TicketFormProps) {
  const { projects, selectedProjectId, projectMembers } = useJira();
  const [initialState] = useState(() => getInitialState(ticket, []));
  const [title, setTitle] = useState(initialState.title);
  const [description, setDescription] = useState(initialState.description);
  const [status, setStatus] = useState<TicketStatus>(initialState.status);
  const [priority, setPriority] = useState<TicketPriority>(initialState.priority);
  const [assigneeId, setAssigneeId] = useState(initialState.assigneeId);
  const [projectId, setProjectId] = useState(initialState.projectId || selectedProjectId);
  const [dueDate, setDueDate] = useState(initialState.dueDate);
  const [assigneeInitialized, setAssigneeInitialized] = useState(false);

  const currentProjectId = projectId || selectedProjectId;
  const availableMembers = projectMembers[currentProjectId] || [];

  // When members load, map the assignee email to user ID if needed (only once)
  if (ticket?.assignee && availableMembers.length > 0 && !assigneeInitialized) {
    const member = availableMembers.find(m => m.email === ticket.assignee);
    if (member) {
      setAssigneeId(member.id);
      setAssigneeInitialized(true);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      status,
      priority,
      assignee: assigneeId,  // Now sending user ID
      projectId: projectId || selectedProjectId,
      dueDate: dueDate || null,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-[#E8E4DD] dark:border-[#3D3D3D]">
          <div>
            <h2 className="text-2xl font-display font-semibold text-[#1A1A1A] dark:text-[#E8E6E3]">
              {ticket ? 'Edit Task' : 'New Task'}
            </h2>
            <p className="text-sm text-[#8B8680] mt-1">
              {ticket ? 'Update task details below' : 'Create a new task for your project'}
            </p>
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
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#E8E6E3] mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter task title..."
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#E8E6E3] mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add a detailed description..."
              className="input-field resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#E8E6E3] mb-2">
              Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="select-field"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#E8E6E3] mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketStatus)}
                className="select-field"
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {s === 'todo' ? 'To Do' : s === 'in-progress' ? 'In Progress' : s === 'in-review' ? 'In Review' : 'Done'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#E8E6E3] mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="select-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#E8E6E3] mb-2">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="select-field"
              >
                <option value="">Unassigned</option>
                {availableMembers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] dark:text-[#E8E6E3] mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {ticket ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}