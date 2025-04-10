<template>
  <div class="redirect-container">
    <div v-if="loading" class="loading-container">
      <h2>Redirecting...</h2>
      <div class="loader"></div>
      <p>You will be redirected shortly</p>
    </div>
    <div v-if="error" class="error-container">
      <h2>Error</h2>
      <p>{{ error }}</p>
      <button @click="goHome" class="home-button">Go to Home</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { urlHelper } from '../utils/urlHelper';

export default {
  name: 'Redirect',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(true);
    const error = ref('');
    
    const goHome = () => {
      router.push('/');
    };
    
    onMounted(async () => {
      try {
        const hash = route.params.hash;
        
        if (!hash) {
          error.value = 'Invalid URL';
          loading.value = false;
          return;
        }
        
        // Get the original URL from the database using the hash
        const response = await urlHelper.get(hash);
        
        if (response && response.success && response.originalUrl) {
          // Redirect to the original URL
          window.location.href = response.originalUrl;
        } else {
          error.value = 'URL not found or expired';
          loading.value = false;
        }
      } catch (err) {
        console.error('Redirect error:', err);
        error.value = 'Failed to retrieve the original URL';
        loading.value = false;
      }
    });
    
    return {
      loading,
      error,
      goHome
    };
  }
};
</script>

<style scoped>
.redirect-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  min-height: 70vh;
}

.loading-container, .error-container {
  text-align: center;
  padding: 2.5rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  width: 100%;
}

.loader {
  margin: 2.5rem auto;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4361ee;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  width: 60px;
  height: 60px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.home-button {
  margin-top: 1.5rem;
  padding: 0.8rem 1.6rem;
  background-color: #4361ee;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.home-button:hover {
  background-color: #3a0ca3;
  transform: translateY(-1px);
}

h2 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.8rem;
  font-weight: 600;
}

p {
  margin: 1rem 0;
  color: #555;
  font-size: 1.1rem;
  line-height: 1.5;
}

.error-container p {
  color: #e63946;
  background-color: rgba(230, 57, 70, 0.1);
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #e63946;
}
</style>