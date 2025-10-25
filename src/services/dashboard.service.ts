// src/services/dashboard.service.ts
import { http } from './http.service';
import type { ReportQueryRequest, ReportQueryResponse } from '../types/dashboard';

export const dashboardService = {

  getAllReportsQuery: (query: ReportQueryRequest) =>
    http.post<ReportQueryResponse>(`/Report/allReportsQueryReport`, query),
};
