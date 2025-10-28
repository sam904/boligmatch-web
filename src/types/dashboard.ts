export interface ReportQueryRequest {
  reportType: string;
  mode: string;
  pagination: PaginationRequest;
  fromDate?: string;
  toDate?: string;
  allRecordsRequired: boolean;
  isExportToExcel: boolean;
  id?: number;
  userId?: string;
  statusId?: string;
  month?: string;
  courseId?: string;
  testId?: string;
}

export interface PaginationRequest {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortDirection: string;
  sortField: string;
  userId: number;
  pageNumber: number;
  rowsPerPage: number;
}

export interface ReportQueryResponse {
  reportData: any[];
  totalCount: number;
  message?: string;
  success: boolean;
}

export interface DashboardStats {
  TotalUsers: number;
  TotalPartners: number;
  TotalRecommendations: number;
  TotalCategorys: number;
  TotalSubCategories: number;
  TotalFalseSubCategories: number;
  TotalPartnerPageVisits: number;
  TotalFavourites: number;
  TodaysPartners: number;
  TodaysRecommendations: number;
  TodaysPartnerPageVisits: number;
  TodaysFavourites: number;
  totalUsers?: number;
  totalPartners?: number;
  totalRecommendations?: number;
  totalCategorys?: number;
  TotalFalseCategorys?: number;
  totalPartnerPageVisits?: number;
  totalFavourites?: number;
  todaysPartners?: number;
  todaysRecommendations?: number;
  todaysPartnerPageVisits?: number;
  todaysFavourites?: number;
}

export interface CategoryUser {
  CategoryName: string;
  FullName: string;
  BusinessName: string;
  BusinessUnit: string;
  categoryName?: string;
  fullName?: string;
  businessName?: string;
  businessUnit?: string;
}