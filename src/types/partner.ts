// src/types/partner.ts

export interface Partner {
  id: number;
  userId: number;
  address: string;
  businessName: string; // NEW FIELD
  businessUnit: number;
  videoUrl?: string;
  logoUrl?: string;
  cvr: number;
  descriptionShort?: string;
  textField1?: string;
  textField2?: string;
  textField3?: string;
  textField4?: string;
  textField5?: string;
  imageUrl1?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  imageUrl4?: string;
  imageUrl5?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: string;
  modifiedBy?: number | null;
  modifiedDate?: string | null;
}

export interface PartnerDto {
  id?: number;
  userId: number;
  address: string;
  businessName: string; // NEW FIELD
  businessUnit: number;
  videoUrl?: string;
  logoUrl?: string;
  cvr: number;
  descriptionShort?: string;
  textField1?: string;
  textField2?: string;
  textField3?: string;
  textField4?: string;
  textField5?: string;
  imageUrl1?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  imageUrl4?: string;
  imageUrl5?: string;
  isActive: boolean;
  createdBy?: number;
  parSubCatlst?: Array<{
    id?: number;
    patnerId?: number;
    subCategoryId: number;
    isActive: boolean;
  }>;
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

export interface PaginatedPartnersResponse {
  output: {
    result: Partner[];
    rowCount: number;
  };
}