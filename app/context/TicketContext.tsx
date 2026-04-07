'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Ticket, TicketStatus } from '@/app/types';
import { saveTickets } from '@/app/utils/storage';

interface TicketContextType {
  tickets: Ticket[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt'>) => void;
  updateTicket: (id: string, ticket: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  moveTicket: (id: string, newStatus: TicketStatus) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

function getInitialTickets(): Ticket[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('jira-clone-tickets');
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function TicketProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(getInitialTickets);

  useEffect(() => {
    saveTickets(tickets);
  }, [tickets]);

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
    <TicketContext.Provider value={{ tickets, addTicket, updateTicket, deleteTicket, moveTicket }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
}
