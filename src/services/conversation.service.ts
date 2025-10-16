// src/services/conversation.service.ts
import { http } from './http.service';

export type Conversation = {
  id: number;
  messageSubject: string;
  messageContent: string;
  senderId: number;
  receiverId: number;
  type: string;
  isActive: boolean;
};

export const conversationService = {
  getById: (id: number) => http.get<Conversation>(`/Conversation/getConversationById/${id}`),
  getAll: (includeInActive = false) =>
    http.get<Conversation[]>(`/Conversation/getAllConversations`, { includeInActive }),
  add: (body: Omit<Conversation, 'id'>) =>
    http.post<Conversation>(`/Conversation/addConversation`, body),
  update: (body: Conversation) => http.put<Conversation>(`/Conversation/updateConversation`, body),
  remove: (id: number) => http.delete<void>(`/Conversation/DeleteConversation/${id}`),
  getPaginated: (query: any) =>
    http.post<{ items: Conversation[]; total: number }>(
      `/Conversation/getPaginatedConversations`,
      query
    ),
};
