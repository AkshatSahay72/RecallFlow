import { apiRequest } from './api';
import type { CalendarEvent } from '../types';

export async function listEvents(): Promise<CalendarEvent[]> {
  return apiRequest('/events/', 'GET');
}

export async function createEvent(eventData: {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
}): Promise<CalendarEvent> {
  return apiRequest('/events/', 'POST', {
    title: eventData.title,
    description: eventData.description || null,
    start_time: eventData.start_time,
    end_time: eventData.end_time,
    location: eventData.location || null,
  });
}

export async function updateEvent(
  eventId: number,
  eventData: {
    title?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    location?: string;
  }
): Promise<CalendarEvent> {
  return apiRequest(`/events/${eventId}`, 'PUT', eventData);
}

export async function deleteEvent(eventId: number): Promise<void> {
  return apiRequest(`/events/${eventId}`, 'DELETE');
}
