import axios from 'axios';
import { getUserId, getAuthHeader } from './authHelper';

const urlHelper = {
  create: async (url, description = "No description provided") => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(await getAuthHeader())
      };
      
      const response = await axios.post(
        `${import.meta.env.VITE_SHARETHINGS_ENDPOINT}/shorten`,
        {
          url,
          description
        },
        {
          headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in urlHelper create:', error);
      throw error;
    }
  },
  
  get: async (hash) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(await getAuthHeader())
      };
      
      const response = await axios.get(
        `${import.meta.env.VITE_SHARETHINGS_ENDPOINT}/shorten?hash=${hash}`,
        {
          headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in urlHelper get:', error);
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
        `${import.meta.env.VITE_SHARETHINGS_ENDPOINT}/shorten?hash=${hash}`,
        {
          headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in urlHelper delete:', error);
      throw error;
    }
  }
};

export { urlHelper };