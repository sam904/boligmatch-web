import { http } from './http.service';
import type {
  PartnerDocument,
  PartnerDocumentDto,
  ApiResponse
} from '../types/partnerdocument';

export const partnerDocumentService = {
  // Get partner document by ID
  getById: (id: number) =>
    http.get<ApiResponse<PartnerDocument>>(`/PartnerDocument/getPartnerDocumentById/${id}`),

  // Get all partner documents
  getAll: (includeInActive = true) =>
    http.get<ApiResponse<PartnerDocument[]>>(`/PartnerDocument/getAllPartnerDocuments`, { includeInActive }),

  // Add new partner document
  addDocument: (document: PartnerDocumentDto) =>
    http.post<ApiResponse<PartnerDocument>>(`/PartnerDocument/addPartnerDocument`, document),

  // Update existing partner document
  updateDocument: (document: PartnerDocumentDto) =>
    http.put<ApiResponse<PartnerDocument>>(`/PartnerDocument/updatePartnerDocument`, document),

  // Delete partner document
  deleteDocument: (id: number) =>
    http.delete<ApiResponse<void>>(`/PartnerDocument/deletePartnerDocument/${id}`),

  // get Document by partner Id
  getPartnerDocumentByPartnerIdList: (id: number) =>
    http.get<ApiResponse<PartnerDocument[]>>(`/Partner/getPartnerDocumentByPartnerIdList/${id}`)
};
