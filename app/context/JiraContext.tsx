'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Ticket, TicketStatus, Project, Attachment } from '@/app/types';

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

interface ApiAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  ticketId: string;
  uploadedById: string;
  uploadedBy?: { id: string; name: string | null; email: string };
  createdAt: string;
}

interface ProjectMember {
  id: string;
  name: string | null;
  email: string;
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
  attachments: Record<string, Attachment[]>;
  setAttachments: (ticketId: string, attachments: Attachment[]) => void;
  addAttachment: (ticketId: string, file: File) => Promise<Attachment>;
  deleteAttachment: (id: string) => Promise<void>;
  isLoading: boolean;
  isTicketsLoading: boolean;
  error: string | null;
  projectMembers: Record<string, ProjectMember[]>;
}

const JiraContext = createContext<JiraContextType | undefined>(undefined);

export function JiraProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [attachments, setAttachmentsState] = useState<Record<string, Attachment[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isTicketsLoading, setIsTicketsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectMembers, setProjectMembers] = useState<Record<string, ProjectMember[]>>({});

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

  const fetchTickets = useCallback(async (projectId?: string) => {
    try {
      setIsTicketsLoading(true);
      const url = projectId ? `/api/tickets?projectId=${projectId}` : '/api/tickets';
      const res = await fetch(url);
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
    } finally {
      setIsTicketsLoading(false);
    }
  }, []);

  const fetchProjectMembers = useCallback(async (projectId: string) => {
    if (projectMembers[projectId]) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) return;
      const project = await res.json();
      const members: ProjectMember[] = [];
      if (project.owner) {
        members.push(project.owner);
      }
      if (project.collaborators) {
        project.collaborators.forEach((c: { user: ProjectMember }) => {
          members.push(c.user);
        });
      }
      setProjectMembers(prev => ({ ...prev, [projectId]: members }));
    } catch (err) {
      console.error('Failed to fetch project members:', err);
    }
  }, [projectMembers]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTickets(selectedProjectId);
      fetchProjectMembers(selectedProjectId);
    } else {
      fetchTickets();
    }
  }, [selectedProjectId, fetchTickets, fetchProjectMembers]);

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
      await res.json();
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
      const mapped = {
        ...newTicket,
        status: (newTicket.status?.toLowerCase().replace('_', '-') || 'todo') as Ticket['status'],
        priority: (newTicket.priority?.toLowerCase() || 'medium') as Ticket['priority'],
        assignee: newTicket.assignee?.email || newTicket.assigneeId || '',
        createdAt: new Date(newTicket.createdAt).getTime(),
      };
      setTickets((prev) => [mapped, ...prev]);
      return mapped;
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
      await res.json();
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
      await res.json();
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const setAttachments = useCallback((ticketId: string, newAttachments: Attachment[]) => {
    setAttachmentsState((prev) => ({
      ...prev,
      [ticketId]: newAttachments,
    }));
  }, []);

  const addAttachment = useCallback(async (ticketId: string, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ticketId', ticketId);

    const res = await fetch('/api/attachments/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || 'Failed to upload attachment');
    }

    const apiAttachment: ApiAttachment = await res.json();
    const attachment: Attachment = {
      ...apiAttachment,
      createdAt: new Date(apiAttachment.createdAt).getTime(),
    };

    setAttachmentsState((prev) => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), attachment],
    }));

    return attachment;
  }, []);

  const deleteAttachment = useCallback(async (id: string) => {
    const res = await fetch(`/api/attachments/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error('Failed to delete attachment');
    }

    setAttachmentsState((prev) => {
      const updated = { ...prev };
      for (const ticketId of Object.keys(updated)) {
        updated[ticketId] = updated[ticketId].filter((a) => a.id !== id);
      }
      return updated;
    });
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
        attachments,
        setAttachments,
        addAttachment,
        deleteAttachment,
        isLoading,
        isTicketsLoading,
        error,
        projectMembers,
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
