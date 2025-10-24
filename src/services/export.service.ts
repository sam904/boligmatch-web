// src/services/export.service.ts
import { axiosClient } from '../lib/axiosClient';

export const exportService = {
  /**
   * Export data to Excel using axios client
   */
  exportToExcel: (params: {
    ReportType: string;
    includeIsActive?: boolean;
    searchTerm?: string;
    isActive?: boolean;
  }) => {
    return axiosClient.get('/api/ExcelDownload/excelDownload', { 
      params,
      responseType: 'blob'
    });
  },
};