// Simple API test utility for debugging
import ApiFetch from './ApiFetch';

export const testTimesheetAPI = async (id = 224) => {
  try {
    console.log('=== Testing Timesheet API ===');
    console.log('Endpoint:', `/operation/timesheet/${id}`);
    
    // Test without authentication (should fail)
    const response = await ApiFetch.get(`/operation/timesheet/${id}`);
    console.log('API Response:', response.data);
    console.log('Response structure:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('API Test Error:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const testTimesheetListAPI = async () => {
  try {
    console.log('=== Testing Timesheet List API ===');
    console.log('Endpoint:', '/operation/timesheet');
    
    const params = {
      dateStart: '2025-10-01',
      dateEnd: '2025-10-15',
      karyawan_id: 2492,
    };
    
    const response = await ApiFetch.get('/operation/timesheet', { params });
    console.log('List API Response:', response.data);
    console.log('List Response structure:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('List API Test Error:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};