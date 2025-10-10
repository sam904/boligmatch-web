// src/services/message.service.ts
import { http } from './http.service';

export type Message = {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
};

export const messageService = {
  getById: (id: number) => http.get<Message>(`/api/Message/getMessageById/${id}`),
  getAll: () => http.get<Message[]>(`/api/Message/getAllMessages`),
  add: (body: Omit<Message, 'id'>) => http.post<Message>(`/api/Message/addMessage`, body),
  update: (body: Message) => http.put<Message>(`/api/Message/updateMessage`, body),
  remove: (id: number) => http.del<void>(`/api/Message/DeleteMessage/${id}`),
  getPaginated: (query: any) =>
    http.post<{ items: Message[]; total: number }>(`/api/Message/getPaginatedMessages`, query),
};
