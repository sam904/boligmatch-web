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
  getById: (id: number) => http.get<Message>(`/Message/getMessageById/${id}`),
  getAll: () => http.get<Message[]>(`/Message/getAllMessages`),
  add: (body: Omit<Message, 'id'>) => http.post<Message>(`/Message/addMessage`, body),
  update: (body: Message) => http.put<Message>(`/Message/updateMessage`, body),
  remove: (id: number) => http.delete<void>(`/Message/DeleteMessage/${id}`),
  getPaginated: (query: any) =>
    http.post<{ items: Message[]; total: number }>(`/Message/getPaginatedMessages`, query),
};
