import React, { useState } from 'react';
import { Button } from "@components/ui/button";
import api from '../../../service/axios';

export default function ApiTester() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (url) => {
    setLoading(true);
    setError(null);
    try {
      // Get the token directly for testing
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await api.get(url, { headers });
      console.log('API Response:', response);
      setResult(response.data);
    } catch (err) {
      console.error('API Error:', err);
      setError(`${err.message} (${err.response?.status || 'Unknown'})`);
      
      // Show more detailed error info
      if (err.response) {
        console.log('Error response data:', err.response.data);
        console.log('Error response status:', err.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <h2 className="font-bold mb-4">API Connection Tester</h2>
      <div className="space-y-2">
        <Button 
          onClick={() => testEndpoint('/api/debug/')}
          disabled={loading}
        >
          Test Debug API
        </Button>
        <Button 
          onClick={() => testEndpoint('/api/skills/')}
          disabled={loading}
          className="ml-2"
        >
          Test Skills API
        </Button>
        <Button 
          onClick={() => testEndpoint('/api/auth/profile/')}
          disabled={loading} 
          className="ml-2"
        >
          Test Main Profile
        </Button>
      </div>
      
      {loading && <p className="mt-4">Loading...</p>}
      
      {error && (
        <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded text-red-600">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <strong>Result:</strong>
          <pre className="bg-gray-50 p-2 rounded mt-2 overflow-auto max-h-64">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-sm">
        <strong>Auth Status:</strong> {localStorage.getItem('accessToken') ? 'Authenticated' : 'Not authenticated'}
      </div>
    </div>
  );
}
