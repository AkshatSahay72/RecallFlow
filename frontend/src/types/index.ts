export interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  due_date: string | null;
  owner_id: number;
  google_task_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  owner_id: number;
  google_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Memory {
  id: number;
  content: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface JournalEntry {
  id: number;
  content: string;
  mood: 'happy' | 'neutral' | 'sad' | 'anxious' | 'tired' | null;
  tags: string[];
  created_at: string;
}
