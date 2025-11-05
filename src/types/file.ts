// src/types/file.ts

export interface File {
  id: number;
  partnerId: number;
  type: string;
  title: string;
  size: number;
  url: string;
  isActive: boolean;
}

export interface FileDto {
  id?: number;
  partnerId: number;
  type: string;
  title: string;
  size: number;
  url: string;
  isActive: boolean;
}

export interface PaginationRequest {
  page: number;
  pageSize: number;
  searchTerm?: string;
  sortDirection?: string;
  sortField?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}