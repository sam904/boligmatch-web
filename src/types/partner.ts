// src/types/partner.ts

export interface Partner {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartnerDto {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface PartnerSubCategory {
  id: number;
  partnerId: number;
  partnerName?: string;
  subCategoryId: number;
  subCategoryName?: string;
  categoryId?: number;
  categoryName?: string;
  isActive: boolean;
}

export interface PartnerSubCategoryDto {
  id?: number;
  partnerId: number;
  subCategoryId: number;
  isActive: boolean;
}
