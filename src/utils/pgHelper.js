import axios from 'axios';
import { getAuthHeader } from './authHelper';

const pgHelper = {
  get: async (page = 1, pageSize = 10) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(await getAuthHeader())
      };
      
      const response = await axios.get(
        `${import.meta.env.VITE_SHARETHINGS_ENDPOINT}/pg`, 
        {
          params: {
            page,
            pageSize
          },
          headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in pgHelper get:', error);
      // Return a formatted error response instead of throwing
      return {
        success: false,
        error: error.message || 'An error occurred during the request'
      };
    }
  },
  
  getMe: async (page = 1, pageSize = 10) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(await getAuthHeader())
      };
      
      const response = await axios.get(
        `${import.meta.env.VITE_SHARETHINGS_ENDPOINT}/pg/me`, 
        {
          params: {
            page,
            pageSize
          },
          headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in pgHelper getMe:', error);
      // Return a formatted error response instead of throwing
      return {
        success: false,
        error: error.message || 'An error occurred during the request'
      };
    }
  },
  
  create: async (text, description = "No description provided") => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(await getAuthHeader())
      };
      
      const response = await axios.post(
        `${import.meta.env.VITE_SHARETHINGS_ENDPOINT}/pg`,
        {
          text,
          description
        },
        {
          headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in pgHelper create:', error);
      throw error;
    }
  },
  
  checkHashType: async (hash) => {
    try {
      const response = await axios.head(
        `${import.meta.env.VITE_SHARETHINGS_ENDPOINT}/pg?hash=${hash}`,
      );
      
      // Get the content-type header from the response
      const contentType = response.headers['content-type'];
      
      // Determine the type based on the content-type
      console.log('Content-Type:', response.headers);
      let type = 'unknown';
      if (contentType) {
        if (contentType.includes('url')) {
          type = 'url';
        } else {
          type = 'file';
        }
      }
      
      return {
        success: true,
        type,
        contentType
      };
    } catch (error) {
      console.error('Error in pgHelper checkHashType:', error);
      return {
        success: false,
        type: 'unknown',
        error: error.message || 'An error occurred during the request'
      };
    }
  }
};

export { pgHelper };