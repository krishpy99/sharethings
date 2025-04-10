<template>
  <div class="file-uploader">
    <div v-if="!isUploaded" class="upload-container">
      <h2>Upload a File</h2>
      <p class="upload-description">Share files securely and generate QR codes for easy sharing</p>
      
      <div class="upload-box" 
        @dragover.prevent="isDragging = true" 
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleFileDrop"
        :class="{ 'dragging': isDragging }"
        @click="$refs.fileInput.click()">
        <input 
          type="file" 
          ref="fileInput" 
          @change="handleFileSelected" 
          class="file-input"
        />
        <div class="upload-content">
          <div class="upload-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16L12 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 11L12 8L15 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 16H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 19H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="upload-prompt"><strong>Drag and drop</strong> your file here, or <span class="browse-text">browse</span></p>
          <p class="upload-limit">Maximum file size: 5MB</p>
        </div>
      </div>
      
      <div v-if="selectedFile" class="file-preview">
        <div class="file-info">
          <div class="file-icon">{{ getFileIcon(selectedFile.type) }}</div>
          <div class="file-details">
            <p class="file-name">{{ selectedFile.name }}</p>
            <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
          </div>
        </div>
        <button @click="resetSelection" class="remove-button">×</button>
      </div>
      
      <div class="input-wrapper">
        <input 
          v-model="description" 
          type="text" 
          placeholder="Add a description to help you remember this file (optional)" 
          class="description-input"
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
        @click="uploadFile" 
        :disabled="!selectedFile || isUploading"
        class="upload-button"
      >
        <svg v-if="isUploading" class="spinner" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke-width="4" stroke-dasharray="30 30" stroke-linecap="round" />
        </svg>
        {{ isUploading ? 'Uploading...' : 'Upload File' }}
      </button>
    </div>
    
    <div v-else class="result-container">
      <div class="success-icon">✓</div>
      <h2>File Uploaded!</h2>
      
      <div class="qr-container">
        <div class="qr-code">
          <img :src="qrCodeUrl" alt="QR Code" />
        </div>
        <div class="qr-instructions">
          <p>Scan this QR code to access your file</p>
          <button @click="downloadQR" class="secondary-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15L12 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20 21H4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Download QR
          </button>
        </div>
      </div>
      
      <div class="share-url">
        <p class="share-label">Share this URL:</p>
        <div class="url-container">
          <div class="url-text">{{ shortUrl }}</div>
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
      
      <p class="expiry-note">
        Link expires on {{ formatDate(expiresAt) }}
      </p>
      
      <button @click="resetForm" class="secondary-button">
        Upload Another File
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { fileHelper } from '../utils/fileHelper';
import { qrHelper } from '../utils/qrHelper';

export default {
  name: 'FileUploader',
  props: {
    userId: {
      type: String,
      default: null
    },
    isAuthenticated: {
      type: Boolean,
      default: false
    }
  },
  
  setup(props) {
    const selectedFile = ref(null);
    const isUploading = ref(false);
    const isUploaded = ref(false);
    const error = ref('');
    const shortUrl = ref('');
    const qrCodeUrl = ref('');
    const expiresAt = ref(null);
    const isDragging = ref(false);
    const copySuccess = ref(false);
    const description = ref('');
    
    onMounted(() => {
      console.log('FileUploader - userId:', props.userId);
    });

    const handleFileSelected = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      if (file.size > 5 * 1024 * 1024) {
        error.value = 'File size exceeds 5MB limit';
        return;
      }
      
      selectedFile.value = file;
      error.value = '';
    };

    const handleFileDrop = (event) => {
      isDragging.value = false;
      
      if (!event.dataTransfer.files.length) return;
      
      const file = event.dataTransfer.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        error.value = 'File size exceeds 5MB limit';
        return;
      }
      
      selectedFile.value = file;
      error.value = '';
    };
    
    const resetSelection = () => {
      selectedFile.value = null;
      error.value = '';
    };
    
    const getFileIcon = (fileType) => {
      if (fileType.startsWith('image/')) return '🖼️';
      if (fileType.startsWith('video/')) return '🎬';
      if (fileType.startsWith('audio/')) return '🎵';
      if (fileType.startsWith('text/')) return '📄';
      if (fileType.includes('pdf')) return '📕';
      if (fileType.includes('zip') || fileType.includes('archive')) return '🗃️';
      if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
      if (fileType.includes('word') || fileType.includes('document')) return '📝';
      return '📁';
    };
    
    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' bytes';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };
    
    const uploadFile = async () => {
      if (!selectedFile.value) return;
      
      isUploading.value = true;
      error.value = '';
      
      try {
        // Using the fileHelper service to upload the file with description
        const response = await fileHelper.create(selectedFile.value, description.value);
        
        if (response.success) {
          // Generate the full URL using the current website's URL
          const currentUrl = window.location.origin;
          const fullUrl = `${currentUrl}/view/${response.hash}`;
          
          console.log(fullUrl);
          shortUrl.value = fullUrl;
          expiresAt.value = new Date(response.expiresAt);
          
          // Generate QR code with the full URL
          const qrResponse = await qrHelper.generate(fullUrl);
          if (qrResponse.success) {
            qrCodeUrl.value = qrResponse.qrCode;
            isUploaded.value = true;
          } else {
            throw new Error(qrResponse.error || 'Failed to generate QR code');
          }
        } else {
          throw new Error(response.error || 'Upload failed');
        }
      } catch (err) {
        console.error('Upload error:', err);
        error.value = err.message || 'Failed to upload file';
      } finally {
        isUploading.value = false;
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
      selectedFile.value = null;
      isUploaded.value = false;
      shortUrl.value = '';
      qrCodeUrl.value = '';
      error.value = '';
      copySuccess.value = false;
      description.value = '';
    };
    
    return {
      selectedFile,
      isUploading,
      isUploaded,
      error,
      shortUrl,
      qrCodeUrl,
      expiresAt,
      isDragging,
      copySuccess,
      description,
      handleFileSelected,
      handleFileDrop,
      resetSelection,
      getFileIcon,
      formatFileSize,
      uploadFile,
      downloadQR,
      copyToClipboard,
      formatDate,
      resetForm
    };
  }
};
</script>

<style scoped>
.file-uploader {
  max-width: 800px;
  margin: 2rem auto;
}

.upload-container, .result-container {
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

.upload-description {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.upload-box {
  border: 2px dashed var(--color-border);
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.upload-box:hover, .upload-box.dragging {
  border-color: var(--color-accent);
  background-color: rgba(0, 112, 243, 0.03);
}

.file-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: rgba(0, 112, 243, 0.1);
  color: var(--color-accent);
  margin-bottom: 1rem;
}

.upload-prompt {
  font-size: 1rem;
  color: var(--color-text);
  margin: 0;
}

.browse-text {
  color: var(--color-accent);
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
}

.upload-limit {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.file-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin: 1.5rem 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-icon {
  font-size: 1.8rem;
}

.file-details {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.file-size {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.remove-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.remove-button:hover {
  background-color: var(--color-border);
  color: var(--color-text);
}

.input-wrapper {
  margin: 1.5rem 0;
}

.description-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--color-text);
  background-color: var(--color-background);
}

.description-input::placeholder {
  color: var(--color-text-secondary);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: 8px;
  color: #f44336;
  margin: 1rem 0;
  font-size: 0.9rem;
}

.upload-button, .secondary-button {
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
  border: none;
  margin-top: 1.5rem;
}

.upload-button {
  width: 100%;
  background-color: var(--color-text);
  color: var(--color-background);
}

.upload-button:hover:not(:disabled) {
  background-color: var(--color-text-secondary);
  transform: translateY(-1px);
}

.upload-button:disabled {
  background-color: var(--color-border);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.secondary-button {
  background-color: var(--color-border);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.secondary-button:hover {
  background-color: var(--color-border);
  transform: translateY(-1px);
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

.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2rem 0;
  gap: 1.5rem;
}

.qr-code {
  padding: 1rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: var(--shadow-small);
}

.qr-code img {
  display: block;
  max-width: 200px;
}

.qr-instructions {
  color: var(--color-text-secondary);
}

.share-url {
  margin: 2rem 0;
}

.share-label {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.8rem;
  text-align: left;
}

.url-container {
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.url-text {
  flex: 1;
  padding: 0.8rem 1rem;
  background-color: var(--color-border);
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  color: var(--color-text);
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

.expiry-note {
  display: inline-block;
  padding: 0.8rem 1.2rem;
  background-color: rgba(255, 193, 7, 0.1);
  border-radius: 8px;
  color: #ff9800;
  font-size: 0.9rem;
  margin: 1rem 0;
}

@media (min-width: 768px) {
  .qr-container {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 2.5rem;
  }
  
  .qr-instructions {
    text-align: left;
    max-width: 220px;
  }
}

@media (max-width: 600px) {
  .upload-container, .result-container {
    padding: 1.5rem;
  }
  
  .upload-box {
    padding: 2rem 1rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
}
</style>