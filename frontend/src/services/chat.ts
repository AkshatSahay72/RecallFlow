import { apiRequest } from './api';

export async function chatWithAgent(message: string): Promise<{ response: string }> {
  return apiRequest('/chat/', 'POST', { message });
}
