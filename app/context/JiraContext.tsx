'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Ticket, TicketStatus, Project } from '@/app/types';

const PROJECTS_KEY = 'jira-clone-projects';
const TICKETS_KEY = 'jira-clone-tickets';

const DEFAULT_PROJECT: Project = {
  id: 'default',
  name: 'General',
  description: 'Default project for existing tickets',
  createdAt: Date.now(),
};

interface JiraContextType {
  projects: Project[];
  tickets: Ticket[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt'>) => void;
  updateTicket: (id: string, ticket: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  moveTicket: (id: string, newStatus: TicketStatus) => void;
}

const JiraContext = createContext<JiraContextType | undefined>(undefined);

function getInitialProjects(): Project[] {
  if (typeof window === 'undefined') return [DEFAULT_PROJECT];
  const stored = localStorage.getItem(PROJECTS_KEY);
  if (!stored) return [DEFAULT_PROJECT];
  try {
    const projects = JSON.parse(stored);
    if (!projects.find((p: Project) => p.id === 'default')) {
      projects.unshift(DEFAULT_PROJECT);
    }
    return projects;
  } catch {
    return [DEFAULT_PROJECT];
  }
}

function getInitialTickets(): Ticket[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(TICKETS_KEY);
  if (!stored) return [];
  try {
    const tickets = JSON.parse(stored);
    return tickets.map((t: Ticket) => ({
      ...t,
      projectId: t.projectId || 'default',
    }));
  } catch {
    return [];
  }
}

export function JiraProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(getInitialProjects);
  const [tickets, setTickets] = useState<Ticket[]>(getInitialTickets);
  const [selectedProjectId, setSelectedProjectId] = useState('default');

  useEffect(() => {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  }, [tickets]);

  const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setProjects((prev) => [...prev, newProject]);
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    if (id === 'default') return;
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const deleteProject = useCallback((id: string) => {
    if (id === 'default') return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTickets((prev) => prev.filter((t) => t.projectId !== id));
    if (selectedProjectId === id) {
      setSelectedProjectId('default');
    }
  }, [selectedProjectId]);

  const addTicket = useCallback((ticket: Omit<Ticket, 'id' | 'createdAt'>) => {
    const newTicket: Ticket = {
      ...ticket,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setTickets((prev) => [...prev, newTicket]);
  }, []);

  const updateTicket = useCallback((id: string, updates: Partial<Ticket>) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTicket = useCallback((id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const moveTicket = useCallback((id: string, newStatus: TicketStatus) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
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