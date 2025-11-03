// src/types/partner.ts

// In your types/partner.ts file, update the Partner interface:
export interface Partner {
  id: number;
  userId: number;
  categoryId: number;
  address: string;
  businessName: string;
  email: string;
  mobileNo: string;
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
  thumbnail?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: string;
  modifiedBy?: number | null;
  modifiedDate?: string | null;
  parSubCatlst?: PartnerSubCategory[];
  parDoclst?: PartnerDocument[];
}

export interface PartnerDto {
  id?: number;
  userId: number;
  categoryId: number;
  address: string;
  businessName: string;
  email: string;
  mobileNo: string;
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
  parSubCatlst?: PartnerSubCategory[];
  parDoclst?: PartnerDocument[];
}
export interface PartnerSubCategory {
  id?: number;
  partnerId?: number;
  subCategoryId: number;
  isActive: boolean;
  subCategories?: string;
  categorys?: string;
}


export interface PartnerDocument {
  id?: number;
  partnerId?: number;
  documentName: string;
  documentType: string;
  documentUrl: string;
  isActive: boolean;
}



export interface PartnerSubCategoryDto {
  id?: number;
  partnerId: number; // FIXED TYPO: patnerId -> partnerId
  subCategoryId: number;
  isActive: boolean;
}

export interface PaginatedPartnersResponse {
  output: {
    result: Partner[];
    rowCount: number;
  };
}