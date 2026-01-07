// src/types/category.ts

export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  bgImageUrl?: string; 
  iconUrl?: string;
  isActive: boolean;
}

export interface CategoryDto {
  id?: number;
  name: string;
  description?: string;
  imageUrl?: string;
  bgImageUrl?: string; 
  iconUrl?: string;
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
