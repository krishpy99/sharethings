<template>
  <div class="text-to-qr">
    <div class="container">
      <div v-if="!showResult" class="input-container">
        <h2>Text to QR Code</h2>
        <p class="description">Convert any text or message into a shareable QR code</p>
        
        <div class="input-wrapper">
          <textarea 
            v-model="text" 
            placeholder="Type or paste your text here..." 
            class="text-input"
            :class="{'error': error}"
            rows="6"
          ></textarea>
          <div class="character-count" :class="{'warning': text.length > 500}">
            {{ text.length }}/1000 characters
          </div>
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
          @click="generateQR" 
          :disabled="isGenerating || !text || text.length > 1000"
          class="generate-button"
        >
          <svg v-if="isGenerating" class="spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke-width="4" stroke-dasharray="30 30" stroke-linecap="round" />
          </svg>
          {{ isGenerating ? 'Generating...' : 'Generate QR Code' }}
        </button>
      </div>
      
      <div v-else class="result-container">
        <div class="success-icon">✓</div>
        <h2>QR Code Generated!</h2>
        
        <div class="qr-display">
          <img :src="qrCodeUrl" alt="Generated QR Code" class="qr-image" />
          
          <div class="qr-actions">
            <div class="text-preview">
              <h3>Encoded Text</h3>
              <p class="encoded-text">{{ text }}</p>
            </div>
            
            <div class="action-buttons">
              <button @click="downloadQR" class="action-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15L12 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M20 21H4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Download QR
              </button>
              
              <button @click="resetForm" class="action-button secondary">
                Create Another
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { qrHelper } from '../utils/qrHelper';

export default {
  name: 'TextToQR',
  setup() {
    const text = ref('');
    const qrCodeUrl = ref('');
    const error = ref('');
    const isGenerating = ref(false);
    const showResult = ref(false);
    
    const generateQR = async () => {
      if (!text.value.trim()) {
        error.value = 'Please enter some text to convert';
        return;
      }
      
      if (text.value.length > 1000) {
        error.value = 'Text exceeds maximum length of 1000 characters';
        return;
      }
      
      error.value = '';
      isGenerating.value = true;
      
      try {
        const response = await qrHelper.generate(text.value);
        
        if (response.success) {
          qrCodeUrl.value = response.qrCode;
          showResult.value = true;
        } else {
          throw new Error(response.error || 'Failed to generate QR code');
        }
      } catch (err) {
        console.error('QR generation error:', err);
        error.value = err.message || 'Failed to generate QR code';
      } finally {
        isGenerating.value = false;
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
    
    const resetForm = () => {
      text.value = '';
      qrCodeUrl.value = '';
      showResult.value = false;
      error.value = '';
    };
    
    return {
      text,
      qrCodeUrl,
      error,
      isGenerating,
      showResult,
      generateQR,
      downloadQR,
      resetForm
    };
  }
};
</script>

<style scoped>
.text-to-qr {
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
  position: relative;
  margin-bottom: 1.5rem;
}

.text-input {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  line-height: 1.5;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  resize: vertical;
  transition: all 0.2s ease;
  background-color: var(--color-background);
  color: var(--color-text);
}

.text-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.1);
}

.text-input.error {
  border-color: #f44336;
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
}

.character-count {
  position: absolute;
  bottom: 0.1rem;
  right: 0.75rem;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.character-count.warning {
  color: #ff9800;
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

.generate-button {
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

.generate-button:hover:not(:disabled) {
  background-color: var(--color-text-secondary);
  transform: translateY(-1px);
}

.generate-button:disabled {
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

.qr-display {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.qr-image {
  display: block;
  max-width: 240px;
  margin: 0 auto;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: var(--shadow-small);
}

.qr-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.text-preview {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  text-align: left;
}

.text-preview h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.encoded-text {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0;
  overflow-wrap: break-word;
  word-break: break-all;
  max-height: 150px;
  overflow-y: auto;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  padding: 0.9rem 1.8rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  cursor: pointer;
  background-color: var(--color-text);
  color: var(--color-background);
  border: none;
}

.action-button:hover {
  transform: translateY(-1px);
}

.action-button.secondary {
  background-color: var(--color-border);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.action-button.secondary:hover {
  background-color: var(--color-border);
}

@media (min-width: 768px) {
  .qr-display {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .qr-image {
    margin: 0;
  }
  
  .qr-actions {
    flex: 1;
    text-align: left;
  }
  
  .action-buttons {
    flex-direction: row;
  }
  
  .action-button {
    flex: 1;
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
</style>