import { http } from './http.service';
import type { 
  Testimonial, 
  TestimonialDto, 
  TestimonialResponse, 
  TestimonialPaginatedQuery, 
  TestimonialPaginatedResponse 
} from '../types/testimonial';

export const testimonialService = {
  // Get testimonial by ID
  getById: (id: number) => http.get<TestimonialResponse>(`/TestImonial/getTestImonialById/${id}`),
  
  // Get all testimonials
  getAll: async (includeInactive = false) => {
    const response = await http.get<{ 
      output: Testimonial[];
      isSuccess: boolean;
      errorMessage: string | null;
    }>(`/TestImonial/getAllTestImonials?includeInactive=${includeInactive}`);
    
    return response.output || [];
  },
  
  // Add new testimonial
  add: (body: TestimonialDto) => http.post<TestimonialResponse>(`/TestImonial/addTestImonial`, body),
  
  // Update testimonial
  update: (body: Testimonial) => http.put<TestimonialResponse>(`/TestImonial/updateTestImonial`, body),
  
  // Delete testimonial
  remove: (id: number) => http.delete<void>(`/TestImonial/deleteTestImonial/${id}`),
  
  // Get paginated testimonials
  getPaginated: async (query: TestimonialPaginatedQuery): Promise<TestimonialPaginatedResponse> => {
    const response = await http.post<{ 
      output: { 
        result: Testimonial[]; 
        rowCount: number; 
      } 
    }>(`/TestImonial/getPaginatedTestImonials`, query);
    
    return {
      items: response.output.result,
      total: response.output.rowCount,
    };
  },

  // Get testimonials by partner ID
  getByPartnerId: async (partnerId: number): Promise<Testimonial[]> => {
    const response = await http.get<{
      output: Testimonial[];
      isSuccess: boolean;
      errorMessage: string | null;
    }>(`/TestImonial/getTestimonialsByPartnerId/${partnerId}`);
    
    return response.output || [];
  },

  // Get active testimonials for display
  getActiveTestimonials: async (): Promise<Testimonial[]> => {
    const response = await http.get<{
      output: Testimonial[];
      isSuccess: boolean;
      errorMessage: string | null;
    }>('/TestImonial/getActiveTestimonials');
    
    return response.output || [];
  },

  // Toggle display status
  toggleDisplay: (id: number, isDisplayed: boolean) => 
    http.patch<void>(`/TestImonial/toggleDisplay/${id}`, { isDisplayed }),

  // Toggle active status
  toggleActive: (id: number, isActive: boolean) => 
    http.patch<void>(`/TestImonial/toggleActive/${id}`, { isActive }),
};