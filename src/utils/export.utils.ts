// src/utils/export.utils.ts
import { toast } from 'sonner';
import { axiosClient } from '../lib/axiosClient';

/**
 * Export to Excel using the existing axios client
 */
export const exportToExcel = async (
  reportType: string,
  params: Record<string, any> = {}
): Promise<void> => {
  try {
    console.log('Exporting with params:', { reportType, ...params });

    const response = await axiosClient.get('/ExcelDownload/excelDownload', {
      params: {
        ReportType: reportType,
        ...params,
      },
      responseType: 'blob', // Important for file downloads
    });

    // Check if response is an Excel file
    const contentType = response.headers['content-type'];
    if (!contentType?.includes('spreadsheetml') && !contentType?.includes('octet-stream')) {
      throw new Error(`Invalid response format: Expected Excel file but got ${contentType}`);
    }

    // Get filename from response headers
    const contentDisposition = response.headers['content-disposition'];
    let filename = `${reportType}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Create blob and download
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    if (blob.size === 0) {
      throw new Error('Empty file received');
    }

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    window.URL.revokeObjectURL(downloadUrl);

    toast.success('Export completed successfully');
    
  } catch (error: any) {
    console.error('Export error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      toast.error('Export service not found. Please contact administrator.');
    } else if (error.response?.status === 401) {
      toast.error('Authentication failed. Please login again.');
    } else if (error.message?.includes('Network Error')) {
      toast.error('Network error: Please check your connection');
    } else {
      toast.error(error.message || 'Failed to export data');
    }
    
    throw error;
  }
};