import { Ticket } from '@/app/types';

const STORAGE_KEY = 'jira-clone-tickets';

export function getTickets(): Ticket[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveTickets(tickets: Ticket[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}
