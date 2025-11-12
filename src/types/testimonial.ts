export interface Testimonial {
  id: number;
  partnerId: number;
  rating: number;
  test: string;
  customerName: string;
  note: string;
  isDisplayed: boolean;
  isActive: boolean;
  createdBy?: number;
  createdDate?: string;
  modifiedBy?: number | null;
  modifiedDate?: string | null;
}

export interface TestimonialDto {
  id?: number;
  partnerId: number;
  rating: number;
  test: string;
  customerName: string;
  note: string;
  isDisplayed: boolean;
  isActive: boolean;
}

export interface TestimonialResponse {
  errorMessage: string | null;
  fileContent: any | null;
  fileName: string | null;
  contentType: string | null;
  failureReason: string | null;
  isSuccess: boolean;
  output: Testimonial;
}

export interface TestimonialPaginatedQuery {
  page: number;
  pageSize: number;
  searchTerm?: string;
  sortDirection?: 'asc' | 'desc';
  sortField?: string;
  partnerId?: number;
  isDisplayed?: boolean;
  isActive?: boolean;
  rating?: number;
}

export interface TestimonialPaginatedResponse {
  items: Testimonial[];
  total: number;
}
