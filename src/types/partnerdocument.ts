export interface PartnerDocument {
  id: number;
  partnerId: number;
  documentName: string;
  documentUrl: string;
  documentType: string | null;
  isActive: boolean;
  createdBy: number;
  createdDate: string;
  modifiedBy: number | null;
  modifiedDate: string | null;
}

export interface PartnerDocumentDto {
  id?: number;
  partnerId: number;
  documentName: string;
  documentUrl: string;
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

// Response wrapper interface to match your API response structure
export interface ApiResponse<T> {
  errorMessage: string | null;
  fileContent: any | null;
  fileName: string | null;
  contentType: string | null;
  failureReason: string | null;
  isSuccess: boolean;
  output: T;
}

export interface PaginatedApiResponse<T> {
  errorMessage: string | null;
  fileContent: any | null;
  fileName: string | null;
  contentType: string | null;
  failureReason: string | null;
  isSuccess: boolean;
  output: PaginatedResponse<T>;
}