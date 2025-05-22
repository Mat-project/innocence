import api from './axios';
import { format } from 'date-fns';

export const reportsAPI = {
  // Get a preview of the report based on the selected parameters
  getReportPreview: async (params) => {
    try {
      const formattedParams = {
        ...params,
        date_from: params.date_from ? format(params.date_from, 'yyyy-MM-dd') : undefined,
        date_to: params.date_to ? format(params.date_to, 'yyyy-MM-dd') : undefined,
      };
      
      const response = await api.get('/api/reports/preview/', { params: formattedParams });
      return response.data;
    } catch (error) {
      console.error('Error fetching report preview:', error);
      throw error;
    }
  },
  
  // Generate and download the full report
  generateReport: async (params) => {
    try {
      const formattedParams = {
        ...params,
        date_from: params.date_from ? format(params.date_from, 'yyyy-MM-dd') : undefined,
        date_to: params.date_to ? format(params.date_to, 'yyyy-MM-dd') : undefined,
      };
      
      // Set the appropriate responseType based on the format
      let responseType = 'blob';
      
      const response = await api.post('/api/reports/generate/', formattedParams, {
        responseType
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }
};

export default reportsAPI;
