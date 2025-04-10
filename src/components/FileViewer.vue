<template>
  <div class="file-viewer">
    <div v-if="!hash" class="hash-input">
      <h2>Enter Hash to View</h2>
      <div class="input-group">
        <input
          v-model="inputHash"
          type="text"
          placeholder="Enter hash here..."
          class="hash-input-field"
        />
        <button @click="handleHashSubmit" class="submit-button">
          View
        </button>
      </div>
    </div>

    <div v-else>
      <div v-if="loading" class="loading">
        Loading...
      </div>
      
      <div v-else-if="error" class="error">
        <h3>Error Loading Content</h3>
        <p>{{ error }}</p>
        <button @click="resetViewer" class="back-button">Go Back</button>
      </div>
      
      <div v-else-if="fileData" class="file-content">
        <div class="file-header">
          <h3>{{ fileData.fileName }}</h3>
          <button @click="downloadFile" class="download-button">Download</button>
        </div>
        
        <div v-if="fileData.contentType.startsWith('image/')" class="preview-container">
          <img :src="fileData.content" :alt="fileData.fileName" class="preview-image" />
        </div>
        
        <div v-else-if="fileData.contentType === 'application/pdf'" class="preview-container">
          <iframe :src="fileData.content" class="preview-pdf"></iframe>
        </div>
        
        <div v-else class="no-preview">
          <p>This file type does not support preview.</p>
          <p>Please download the file to view its contents.</p>
        </div>
        
        <p class="expiry-note">
          Available until: {{ formatDate(fileData.expiresAt) }}
        </p>
      </div>
      
      <div v-else class="not-found">
        <h3>Content Not Found</h3>
        <p>The requested content could not be found or has expired.</p>
        <button @click="resetViewer" class="back-button">Go Back</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fileHelper } from '../utils/fileHelper';

export default {
  name: 'FileViewer',
  props: {
    initialHash: {
      type: String,
      default: ''
    }
  },
  
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const fileData = ref(null);
    const loading = ref(false);
    const error = ref('');
    const hash = ref('');
    const inputHash = ref('');

    // Set initial hash from props or route
    onMounted(() => {
      if (props.initialHash) {
        hash.value = props.initialHash;
        loadContent();
      } else if (route.params.hash) {
        hash.value = route.params.hash;
        loadContent();
      }
    });

    // Watch for changes to initialHash prop
    watch(() => props.initialHash, (newValue) => {
      if (newValue && newValue !== hash.value) {
        hash.value = newValue;
        loadContent();
      }
    });

    const handleHashSubmit = async () => {
      if (!inputHash.value) return;
      hash.value = inputHash.value;
      await loadContent();
    };

    const loadContent = async () => {
      if (!hash.value) return;
      
      loading.value = true;
      error.value = '';
      fileData.value = null;
      
      try {
        // Using fileHelper.get to retrieve the file
        const response = await fileHelper.get(hash.value);
        
        // Now response contains contentType and base64 content separately
        const contentType = response.contentType;
        const fileName = response.fileName || hash.value; // Use provided fileName or hash
        
        // No need to convert to base64 as response already has base64 content
        fileData.value = {
          fileName,
          contentType,
          content: `data:${contentType};base64,${response.content}`, // Create proper data URL
          expiresAt: response.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };
        
        loading.value = false;
      } catch (err) {
        console.error('Error loading content:', err);
        error.value = err.message || 'Failed to load content';
        loading.value = false;
      }
    };
    
    const downloadFile = () => {
      if (!fileData.value) return;
      
      const link = document.createElement('a');
      link.href = fileData.value.content;
      link.download = fileData.value.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleString();
    };

    const resetViewer = () => {
      hash.value = '';
      inputHash.value = '';
      fileData.value = null;
      error.value = '';
    };
    
    return {
      fileData,
      loading,
      error,
      hash,
      inputHash,
      handleHashSubmit,
      downloadFile,
      formatDate,
      resetViewer,
      loadContent
    };
  }
};
</script>

<style scoped>
.file-viewer {
  padding: 2.5rem;
  background-color: var(--color-background);
  border-radius: 12px;
  box-shadow: var(--shadow-small);
}

.hash-input {
  text-align: center;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hash-input h2 {
  margin-bottom: 1.5rem;
  color: var(--color-text);
  font-weight: 600;
  font-size: 1.8rem;
}

.input-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.hash-input-field {
  padding: 0.8rem 1.2rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  min-width: 300px;
  transition: all 0.2s ease;
  background-color: var(--color-background);
  color: var(--color-text);
}

.hash-input-field:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
  outline: none;
}

.submit-button {
  padding: 0.8rem 1.5rem;
  background-color: var(--color-accent);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.submit-button:hover {
  background-color: #3a0ca3;
  transform: translateY(-1px);
}

.loading, .error, .not-found {
  text-align: center;
  padding: 3rem;
  margin: 1rem 0;
  border-radius: 8px;
}

.loading {
  background-color: var(--color-border);
}

.error {
  color: #e63946;
  background-color: rgba(230, 57, 70, 0.1);
  border-left: 4px solid #e63946;
}

.not-found {
  background-color: var(--color-border);
}

.file-content {
  padding: 1rem;
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.file-header h3 {
  font-size: 1.4rem;
  margin: 0;
  color: var(--color-text);
  font-weight: 600;
}

.preview-container {
  margin: 2rem 0;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow-small);
}

.preview-image {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}

.preview-pdf {
  border: none;
  min-height: 1000px;
  width: 100%;
}

.no-preview {
  text-align: center;
  padding: 3rem;
  background-color: var(--color-border);
  border-radius: 8px;
  margin: 2rem 0;
  color: var(--color-text);
}

.download-button, .back-button {
  padding: 0.8rem 1.6rem;
  border-radius: 8px;
  border: none;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.download-button {
  background-color: var(--color-accent);
  color: white;
}

.download-button:hover {
  background-color: #3a0ca3;
  transform: translateY(-1px);
}

.back-button {
  background-color: #6c757d;
  color: white;
}

.back-button:hover {
  background-color: #5a6268;
}

.expiry-note {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-top: 2rem;
  text-align: center;
  background-color: rgba(255, 193, 7, 0.1);
  padding: 0.8rem 1rem;
  border-radius: 6px;
  border-left: 3px solid #ffc107;
}
</style>