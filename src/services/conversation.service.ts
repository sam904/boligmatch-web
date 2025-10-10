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
  getById: (id: number) => http.get<Conversation>(`/api/Conversation/getConversationById/${id}`),
  getAll: (includeInActive = false) =>
    http.get<Conversation[]>(`/api/Conversation/getAllConversations`, { includeInActive }),
  add: (body: Omit<Conversation, 'id'>) =>
    http.post<Conversation>(`/api/Conversation/addConversation`, body),
  update: (body: Conversation) => http.put<Conversation>(`/api/Conversation/updateConversation`, body),
  remove: (id: number) => http.del<void>(`/api/Conversation/DeleteConversation/${id}`),
  getPaginated: (query: any) =>
    http.post<{ items: Conversation[]; total: number }>(
      `/api/Conversation/getPaginatedConversations`,
      query
    ),
};
