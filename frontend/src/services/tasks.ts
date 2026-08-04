import { apiRequest } from './api';
import type { Task } from '../types';

export async function listTasks(): Promise<Task[]> {
  return apiRequest('/tasks/', 'GET');
}

export async function createTask(taskData: {
  title: string;
  description?: string;
  due_date?: string;
}): Promise<Task> {
  return apiRequest('/tasks/', 'POST', {
    title: taskData.title,
    description: taskData.description || null,
    due_date: taskData.due_date || null,
  });
}

export async function updateTask(
  taskId: number,
  taskData: {
    title?: string;
    description?: string;
    is_completed?: boolean;
    due_date?: string | null;
  }
): Promise<Task> {
  return apiRequest(`/tasks/${taskId}`, 'PUT', taskData);
}

export async function deleteTask(taskId: number): Promise<void> {
  return apiRequest(`/tasks/${taskId}`, 'DELETE');
}
