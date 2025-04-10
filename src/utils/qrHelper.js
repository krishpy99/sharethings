import axios from 'axios';
import { getAuthHeader } from './authHelper';

const qrHelper = {
  generate: async (text) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SHARETHINGS_ENDPOINT}/generate`,
        {
          text
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in qrHelper generate:', error);
      throw error;
    }
  },
};

export { qrHelper };