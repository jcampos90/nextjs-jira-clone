'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Ticket, TicketStatus, Project } from '@/app/types';

interface ApiProject {
  id: string;
  name: string;
  description: string;
  prefix: string;
  nextTicketNumber: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner: { id: string; name: string | null; email: string };
}

interface ApiTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  creatorId: string;
  assigneeId: string | null;
  dueDate: string | null;
  creator: { id: string; name: string | null; email: string };
  assignee: { id: string; name: string | null; email: string } | null;
}

interface JiraContextType {
  projects: Project[];
  tickets: Ticket[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'ownerId'>) => Promise<Project | null>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt'>) => Promise<Ticket | null>;
  updateTicket: (id: string, ticket: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  moveTicket: (id: string, newStatus: TicketStatus) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const JiraContext = createContext<JiraContextType | undefined>(undefined);

export function JiraProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      const mapped = data.map((p: ApiProject) => ({
        ...p,
        createdAt: new Date(p.createdAt).getTime(),
      }));
      setProjects(mapped);
      if (mapped.length > 0 && !selectedProjectId) {
        setSelectedProjectId(mapped[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId]);

  const fetchTickets = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`/api/tickets?projectId=${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data = await res.json();
      const mapped = data.map((t: ApiTicket) => ({
        ...t,
        status: (t.status?.toLowerCase().replace('_', '-') || 'todo') as Ticket['status'],
        priority: (t.priority?.toLowerCase() || 'medium') as Ticket['priority'],
        assignee: t.assignee?.email || t.assigneeId || '',
        createdAt: new Date(t.createdAt).getTime(),
      }));
      setTickets(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTickets(selectedProjectId);
    }
  }, [selectedProjectId, fetchTickets]);

  const addProject = useCallback(async (project: Omit<Project, 'id' | 'createdAt' | 'ownerId'>): Promise<Project | null> => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (!res.ok) throw new Error('Failed to create project');
      const newProject = await res.json();
      setProjects((prev) => [newProject, ...prev]);
      setSelectedProjectId(newProject.id);
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update project');
      const _updated = await res.json();
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete project');
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setTickets((prev) => prev.filter((t) => t.projectId !== id));
      if (selectedProjectId === id) {
        setSelectedProjectId(projects.find((p) => p.id !== id)?.id || '');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [selectedProjectId, projects]);

  const addTicket = useCallback(async (ticket: Omit<Ticket, 'id' | 'createdAt'>): Promise<Ticket | null> => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ticket,
          status: ticket.status.toUpperCase().replace('-', '_'),
          priority: ticket.priority.toUpperCase(),
        }),
      });
      if (!res.ok) throw new Error('Failed to create ticket');
      const newTicket = await res.json();
      setTickets((prev) => [newTicket, ...prev]);
      return newTicket;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const updateTicket = useCallback(async (id: string, updates: Partial<Ticket>) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          status: updates.status?.toUpperCase().replace('-', '_'),
          priority: updates.priority?.toUpperCase(),
        }),
      });
      if (!res.ok) throw new Error('Failed to update ticket');
      const _updated = await res.json();
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const deleteTicket = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete ticket');
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const moveTicket = useCallback(async (id: string, newStatus: TicketStatus) => {
    const statusMap: Record<TicketStatus, string> = {
      'todo': 'TODO',
      'in-progress': 'IN_PROGRESS',
      'in-review': 'IN_REVIEW',
      'done': 'DONE',
    };
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusMap[newStatus] }),
      });
      if (!res.ok) throw new Error('Failed to move ticket');
      const _updated = await res.json();
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  return (
    <JiraContext.Provider
      value={{
        projects,
        tickets,
        selectedProjectId,
        setSelectedProjectId,
        addProject,
        updateProject,
        deleteProject,
        addTicket,
        updateTicket,
        deleteTicket,
        moveTicket,
        isLoading,
        error,
      }}
    >
      {children}
    </JiraContext.Provider>
  );
}

export function useJira() {
  const context = useContext(JiraContext);
  if (!context) {
    throw new Error('useJira must be used within a JiraProvider');
  }
  return context;
}
