// src/services/category.service.ts
import { http } from './http.service';

export type Category = {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  iconUrl?: string;
  isActive: boolean;
};

// Add this new type for subcategories by category
export type SubCategoryByCategory = {
  category: string;
  categoryDescription: string;
  subCategory: string;
  subCategoryDescription: string;
};

export type PaginatedQuery = {
  page: number;
  pageSize: number;
  searchTerm?: string;
  sortDirection?: 'asc' | 'desc';
  sortField?: string;
  userId?: number;
  isFeatured?: number;
  isPrivateCourse?: boolean;
  isPublish?: boolean;
  statusId?: number;
  
};

export const categoryService = {
  getById: (id: number) => http.get<Category>(`/Category/getCategoryById/${id}`),
  
  getAll: async (includeInActive = false) => {
    const response = await http.get<{ 
      output: Category[];
      isSuccess: boolean;
      errorMessage: string | null;
    }>(`/Category/getAllCategorys?includeInActive=${includeInActive}`);
    
    return response.output || [];
  },
  
  add: (body: Omit<Category, 'id'>) => http.post<Category>(`/Category/addCategory`, body),
  
  update: (body: Category) => http.put<Category>(`/Category/updateCategory`, body),
  
  remove: (id: number) => http.delete<void>(`/Category/DeleteCategory/${id}`),
  
  getPaginated: async (query: PaginatedQuery) => {
    const response = await http.post<{ output: { result: Category[]; rowCount: number } }>(`/Category/getPaginatedCategorys`, query);
    return {
      items: response.output.result,
      total: response.output.rowCount,
    };
  },

  // NEW METHOD: Get subcategories by category ID
  getSubCategoriesByCategoryId: async (categoryId: number): Promise<SubCategoryByCategory[]> => {
    const response = await http.get<{
      output: SubCategoryByCategory[];
      isSuccess: boolean;
      errorMessage: string | null;
    }>(`/Category/getSubCategoriesByCategoryId/${categoryId}`);
    
    return response.output || [];
  },
};