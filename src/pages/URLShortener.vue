<template>
  <div class="url-shortener">
    <div class="container">
      <div v-if="!isShortened" class="input-container">
        <h2>URL Shortener</h2>
        <p class="description">Create shorter links and QR codes for your long URLs</p>
        
        <div class="input-wrapper">
          <input 
            v-model="url" 
            type="url" 
            placeholder="Enter your URL (e.g., https://example.com/very-long-url)" 
            class="url-input"
            :class="{'error': error}"
          />
        </div>

        <div class="input-wrapper">
          <input 
            v-model="description" 
            type="text" 
            placeholder="Add a description to help you remember this link (optional)" 
            class="url-input"
          />
        </div>

        <div v-if="error" class="error-message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 16V16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          {{ error }}
        </div>
        
        <button 
          @click="shortenURL" 
          :disabled="isProcessing || !url"
          class="shorten-button"
        >
          <svg v-if="isProcessing" class="spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke-width="4" stroke-dasharray="30 30" stroke-linecap="round" />
          </svg>
          {{ isProcessing ? 'Processing...' : 'Shorten URL' }}
        </button>
      </div>
      
      <div v-else class="result-container">
        <div class="success-icon">✓</div>
        <h2>URL Shortened!</h2>
        
        <div class="result-content">
          <div class="original-url">
            <h3>Original URL</h3>
            <p class="url-text original">{{ url }}</p>
          </div>
          
          <div class="arrow-container">
            <svg width="40" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 5L19 12L12 19" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <div class="shortened-url-container">
            <h3>Shortened URL</h3>
            <div class="shortened-url">
              <div class="shortened-url-text">{{ shortUrl }}</div>
              <button @click="copyToClipboard" class="copy-button">
                <svg v-if="!copySuccess" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M8 16H6C4.89543 16 4 15.1046 4 14V6C4 4.89543 4.89543 4 6 4H14C15.1046 4 16 4.89543 16 6V8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ copySuccess ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="qr-preview">
          <h3>QR Code</h3>
          <div class="qr-container">
            <img :src="qrCodeUrl" alt="QR Code" class="qr-image" />
            <button @click="downloadQR" class="qr-download-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15L12 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20 21H4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Download
            </button>
          </div>
        </div>
        
        <p class="expiry-note">
          Link expires on {{ formatDate(expiresAt) }}
        </p>
        
        <button @click="resetForm" class="new-url-button">
          Shorten Another URL
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { urlHelper } from '../utils/urlHelper';
import { qrHelper } from '../utils/qrHelper';

export default {
  name: 'URLShortener',
  props: {
    userId: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const url = ref('');
    const description = ref('');
    const shortUrl = ref('');
    const shortHash = ref('');
    const qrCodeUrl = ref('');
    const error = ref('');
    const isProcessing = ref(false);
    const isShortened = ref(false);
    const copySuccess = ref(false);
    const expiresAt = ref(null);
    
    onMounted(() => {
      console.log('URLShortener - userId:', props.userId);
    });
    
    const validateURL = (url) => {
      try {
        // The URL constructor will throw if the URL is invalid
        new URL(url);
        return true;
      } catch (e) {
        return false;
      }
    };
    
    const shortenURL = async () => {
      if (!url.value.trim()) {
        error.value = 'Please enter a URL';
        return;
      }
      
      // Automatically prepend http:// if no protocol is specified
      if (!/^https?:\/\//i.test(url.value)) {
        url.value = 'http://' + url.value;
      }
      
      if (!validateURL(url.value)) {
        error.value = 'Please enter a valid URL';
        return;
      }
      
      error.value = '';
      isProcessing.value = true;
      
      try {
        const response = await urlHelper.create(url.value, description.value);
        
        if (response.success) {
          // Generate the full short URL using the current website's URL
          const currentUrl = window.location.origin;
          shortHash.value = response.hash;
          shortUrl.value = `${currentUrl}/r/${response.hash}`;
          expiresAt.value = new Date(response.expiresAt);
          
          // Generate QR code with the short URL
          const qrResponse = await qrHelper.generate(shortUrl.value);
          if (qrResponse.success) {
            qrCodeUrl.value = qrResponse.qrCode;
            isShortened.value = true;
          } else {
            throw new Error(qrResponse.error || 'Failed to generate QR code');
          }
        } else {
          throw new Error(response.error || 'Failed to shorten URL');
        }
      } catch (err) {
        console.error('URL shortening error:', err);
        error.value = err.message || 'Failed to shorten URL';
      } finally {
        isProcessing.value = false;
      }
    };
    
    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(shortUrl.value);
        copySuccess.value = true;
        
        setTimeout(() => {
          copySuccess.value = false;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    };
    
    const downloadQR = () => {
      if (!qrCodeUrl.value) return;
      
      const link = document.createElement('a');
      link.download = 'qr-code.png';
      link.href = qrCodeUrl.value;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    const formatDate = (date) => {
      if (!date) return '';
      
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      return new Date(date).toLocaleDateString(undefined, options);
    };
    
    const resetForm = () => {
      url.value = '';
      description.value = '';
      shortUrl.value = '';
      shortHash.value = '';
      qrCodeUrl.value = '';
      isShortened.value = false;
      error.value = '';
      copySuccess.value = false;
    };
    
    return {
      url,
      description,
      shortUrl,
      qrCodeUrl,
      error,
      isProcessing,
      isShortened,
      copySuccess,
      expiresAt,
      shortenURL,
      copyToClipboard,
      downloadQR,
      formatDate,
      resetForm
    };
  }
};
</script>

<style scoped>
.url-shortener {
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.input-container, .result-container {
  background-color: var(--color-background);
  border-radius: 12px;
  box-shadow: var(--shadow-small);
  padding: 2.5rem;
}

h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.03em;
  color: var(--color-text);
}

.description {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.input-wrapper {
  margin-bottom: 1.5rem;
}

.url-input {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: all 0.2s ease;
  background-color: var(--color-background);
  color: var(--color-text);
}

.url-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
}

.url-input.error {
  border-color: #f44336;
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: 8px;
  color: #f44336;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.shorten-button, .new-url-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  width: 100%;
  padding: 0.9rem 1.8rem;
  background-color: var(--color-text);
  color: var(--color-background);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.shorten-button:hover:not(:disabled), .new-url-button:hover {
  background-color: var(--color-text-secondary);
  transform: translateY(-1px);
}

.shorten-button:disabled {
  background-color: var(--color-border);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.spinner {
  animation: spin 1.5s linear infinite;
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.result-container {
  text-align: center;
}

.success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.result-content {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.original-url, .shortened-url-container {
  width: 100%;
  text-align: left;
}

.url-text {
  font-size: 0.9rem;
  word-break: break-all;
  border-radius: 8px;
  padding: 0.8rem 1rem;
}

.original {
  background-color: var(--color-border);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.shortened-url {
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.shortened-url-text {
  flex: 1;
  padding: 0.8rem 1rem;
  background-color: var(--color-border);
  font-size: 0.9rem;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background-color: var(--color-background);
  color: var(--color-text);
  border: none;
  border-left: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.copy-button:hover {
  background-color: var(--color-border);
}

.arrow-container {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
  color: var(--color-text-secondary);
}

.arrow-container svg path {
  stroke: var(--color-text);
}

.qr-preview {
  margin: 2rem 0;
  text-align: center;
}

.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.qr-image {
  max-width: 180px;
  padding: 0.8rem;
  border-radius: 8px;
  box-shadow: var(--shadow-small);
  background-color: white;
}

.qr-download-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1.5rem;
  background-color: var(--color-border);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qr-download-button:hover {
  background-color: var(--color-border);
  transform: translateY(-1px);
}

.expiry-note {
  display: inline-block;
  padding: 0.8rem 1.2rem;
  background-color: rgba(255, 193, 7, 0.1);
  border-radius: 8px;
  color: #ff9800;
  font-size: 0.9rem;
  margin: 1rem 0 2rem;
}

@media (min-width: 768px) {
  .result-content {
    flex-direction: row;
    align-items: flex-start;
    gap: 1.5rem;
  }
  
  .original-url, .shortened-url-container {
    flex: 1;
  }
  
  .arrow-container {
    margin: 2rem 0 0 0;
    transform: rotate(90deg);
  }
}

@media (max-width: 600px) {
  .input-container, .result-container {
    padding: 1.5rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
}

/* Enhanced mobile styles */
@media (max-width: 768px) {
  .input-container, .result-container {
    padding: 1.8rem;
  }
  
  h2 {
    font-size: 1.6rem;
  }
  
  .description {
    font-size: 0.95rem;
  }
  
  .url-input {
    padding: 0.8rem;
    font-size: 0.95rem;
  }
  
  .error-message {
    font-size: 0.85rem;
  }
  
  .shorten-button, .new-url-button {
    padding: 0.8rem 1.5rem;
    font-size: 0.95rem;
  }
  
  .success-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
  .qr-image {
    max-width: 150px;
  }
}

@media (max-width: 480px) {
  .input-container, .result-container {
    padding: 1.2rem;
  }
  
  h2 {
    font-size: 1.4rem;
  }
  
  .description {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
  
  .url-input {
    padding: 0.7rem;
    font-size: 0.9rem;
  }
  
  .shorten-button, .new-url-button {
    padding: 0.7rem 1.2rem;
    font-size: 0.9rem;
  }
  
  .success-icon {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
  }
  
  .qr-image {
    max-width: 130px;
  }
  
  .result-content {
    gap: 0.5rem;
  }
  
  .url-text {
    font-size: 0.8rem;
    padding: 0.6rem 0.8rem;
    word-break: break-all;
  }

  .shortened-url-text {
    font-size: 0.8rem;
    padding: 0.6rem 0.8rem;
  }
  
  .copy-button {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }
  
  .expiry-note {
    font-size: 0.8rem;
    padding: 0.6rem 1rem;
    margin: 0.8rem 0 1.5rem;
  }
}
</style>