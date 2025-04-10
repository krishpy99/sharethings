import axios from 'axios';
import { isAuthenticated, getAuthHeader } from './authHelper';

const fileHelper = {
  create: async (file, description = "No description provided") => {
    try {
      const authenticated = isAuthenticated();
      const headers = {
        'Content-Type': 'application/json',
        ...(await getAuthHeader())
      };
      
      const response = await axios.post(
        `${import.meta.env.VITE_SHARETHINGS_ENDPOINT}/file`,
        {
          file: {
            name: file.name,
            type: file.type,
            content: await fileToBase64(file)
          },
          isAuthenticated: authenticated,
          description
        },
        {
          headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in fileHelper create:', error);
      throw error;
    }
  },
  
  get: async (hash) => {
    try {
      const headers = await getAuthHeader();
      
      const response = await axios.get(
        `${import.meta.env.VITE_SHARETHINGS_ENDPOINT}/file?hash=${hash}`,
        {
          responseType: 'json',
          headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in fileHelper get:', error);
      throw error;
    }
  },
  
  delete: async (hash) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(await getAuthHeader())
      };
      
      const response = await axios.delete(
        `${import.meta.env.VITE_SHARETHINGS_ENDPOINT}/file?hash=${hash}`,
        {
          headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in fileHelper delete:', error);
      throw error;
    }
  }
};

// Helper function to convert File object to base64 string
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

export { fileHelper };