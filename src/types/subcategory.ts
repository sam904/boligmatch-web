// src/types/subcategory.ts

export interface SubCategory {
  id: number;
  categoryId: number;
  categoryName?: string;
  name: string;
  imageUrl?: string;
  iconUrl?: string;
  isActive: boolean;
}

export interface SubCategoryDto {
  id?: number;
  categoryId: number;
  name: string;
  imageUrl?: string;
  iconUrl?: string;
  isActive: boolean;
}