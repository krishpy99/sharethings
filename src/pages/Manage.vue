<template>
  <div class="manage-container">
    <div class="tabs">
      <div 
        v-if="userId" 
        class="tab"
        :class="{ 'active': activeTab === 'user' }"
        @click="activeTab = 'user'"
      >
        My Requests
      </div>
      <div 
        class="tab"
        :class="{ 'active': activeTab === 'public' }"
        @click="activeTab = 'public'"
      >
        Public Requests
      </div>
    </div>
    
    <div class="tab-content">
      <div v-if="loading" class="loading">
        Loading...
      </div>
      
      <template v-else>
        <div v-if="activeTab === 'user' && userId" class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th v-for="col in displayColumns" :key="col.key">{{ col.title }}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!userData.items.length">
                <td :colspan="displayColumns.length + 1" class="empty-message">No data found</td>
              </tr>
              <tr v-for="item in userData.items" :key="item.hash">
                <td>{{ item.hash }}</td>
                <td>{{ getContentTypeDisplay(item) }}</td>
                <td>{{ item.description }}</td>
                <td>{{ formatSimpleDate(item.created_at) }}</td>
                <td>{{ formatSimpleDate(item.expires_at) }}</td>
                <td class="action-buttons">
                  <button @click="viewItem(item)" class="view-button">View</button>
                  <button v-if="activeTab === 'user'" @click="deleteItem(item)" class="delete-button">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="userData.pagination.totalPages > 0" class="pagination-controls">
            <button 
              :disabled="userPage === 1" 
              @click="handleUserPageChange('prev')"
              class="page-button"
            >
              &larr;
            </button>
            <span class="page-info">{{ userPage }} / {{ userData.pagination.totalPages }}</span>
            <button 
              :disabled="userPage === userData.pagination.totalPages" 
              @click="handleUserPageChange('next')"
              class="page-button"
            >
              &rarr;
            </button>
          </div>
        </div>
        
        <div v-if="activeTab === 'public'" class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th v-for="col in displayColumns" :key="col.key">{{ col.title }}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!publicData.items.length">
                <td :colspan="displayColumns.length + 1" class="empty-message">No data found</td>
              </tr>
              <tr v-for="item in publicData.items" :key="item.hash">
                <td>{{ item.hash }}</td>
                <td>{{ getContentTypeDisplay(item) }}</td>
                <td>{{ item.description }}</td>
                <td>{{ formatSimpleDate(item.created_at) }}</td>
                <td>{{ formatSimpleDate(item.expires_at) }}</td>
                <td class="action-buttons">
                  <button @click="viewItem(item)" class="view-button">View</button>
                  <button v-if="activeTab === 'user'" @click="deleteItem(item)" class="delete-button">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="publicData.pagination.totalPages > 0" class="pagination-controls">
            <button 
              :disabled="publicPage === 1" 
              @click="handlePublicPageChange('prev')"
              class="page-button"
            >
              &larr;
            </button>
            <span class="page-info">{{ publicPage }} / {{ publicData.pagination.totalPages }}</span>
            <button 
              :disabled="publicPage === publicData.pagination.totalPages" 
              @click="handlePublicPageChange('next')"
              class="page-button"
            >
              &rarr;
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { pgHelper } from '../utils/pgHelper';
import { urlHelper } from '../utils/urlHelper';
import { fileHelper } from '../utils/fileHelper';

export default {
  name: 'Manage',
  props: {
    userId: {
      type: String,
      default: null
    }
  },
  
  setup(props) {
    const loading = ref(false);
    const activeTab = ref(props.userId ? 'user' : 'public');
    const userPage = ref(1);
    const publicPage = ref(1);
    const pageSize = 10;
    
    onMounted(() => {
      console.log('Manage - userId:', props.userId);
    });
    
    const userData = reactive({
      items: [],
      pagination: { total: 0, page: 1, pageSize: 10, totalPages: 1 }
    });
    
    const publicData = reactive({
      items: [],
      pagination: { total: 0, page: 1, pageSize: 10, totalPages: 1 }
    });
    
    // Only include the columns we want to display
    const displayColumns = [
      { title: 'Hash', key: 'hash' },
      { title: 'Type', key: 'content_type' },
      { title: 'Description', key: 'description' },
      { title: 'Created', key: 'created_at' },
      { title: 'Expires', key: 'expires_at' }
    ];

    // Keep the full columns definition for backward compatibility
    const columns = [
      { title: 'Hash', key: 'hash' },
      { title: 'Type', key: 'type' },
      { title: 'Original URL', key: 'original_url' },
      { title: 'File Key', key: 'file_key' },
      { title: 'Content Type', key: 'content_type' },
      { title: 'Created At', key: 'created_at' },
      { title: 'Expires At', key: 'expires_at' }
    ];
    
    const fetchData = async (page, pageSize) => {
      try {
        loading.value = true;
        const response = await pgHelper.get(page, pageSize);
        
        if (response.success) {
          if (props.userId) {
            userData.items = response.data.items;
            userData.pagination = response.data.pagination;
          } else {
            publicData.items = response.data.items;
            publicData.pagination = response.data.pagination;
          }
        } else {
          console.error('Failed to fetch data:', response.error);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const fetchUserData = async (page, pageSize) => {
      try {
        loading.value = true;
        const response = await pgHelper.getMe(page, pageSize);
        
        if (response.success) {
          userData.items = response.data.items;
          userData.pagination = response.data.pagination;
        } else {
          console.error('Failed to fetch user data:', response.error);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const fetchPublicData = async (page, pageSize) => {
      try {
        loading.value = true;
        const response = await pgHelper.get(page, pageSize);
        
        if (response.success) {
          publicData.items = response.data.items;
          publicData.pagination = response.data.pagination;
        } else {
          console.error('Failed to fetch public data:', response.error);
        }
      } catch (error) {
        console.error('Error fetching public data:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const handleUserPageChange = (direction) => {
      const newPage = direction === 'next' ? userPage.value + 1 : userPage.value - 1;
      if (newPage > 0 && newPage <= userData.pagination.totalPages) {
        userPage.value = newPage;
      }
    };
    
    const handlePublicPageChange = (direction) => {
      const newPage = direction === 'next' ? publicPage.value + 1 : publicPage.value - 1;
      if (newPage > 0 && newPage <= publicData.pagination.totalPages) {
        publicPage.value = newPage;
      }
    };
    
    // Format date to mm/dd/yyyy as requested
    const formatSimpleDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };
    
    // Original date formatter kept for backward compatibility
    const formatDate = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleString();
    };
    
    // Get content type display (URL or actual content type)
    const getContentTypeDisplay = (item) => {
      if (item.type !== 'file') {
        return 'URL';
      }
      return item.content_type || 'File';
    };
    
    // View item function
    const viewItem = (item) => {
      // If it's a URL, open the redirect page
      if (item.type === 'url') {
        window.open(`/r/${item.hash}`, '_blank');
      } else {
        // If it's a file, fetch and open it
        window.open(`/view/${item.hash}`);
      }
    };
    
    // Delete item function
    const deleteItem = async (item) => {
      if (!confirm(`Are you sure you want to delete this ${item.type}?`)) {
        return;
      }
      
      loading.value = true;
      try {
        let result;
        
        // Use the appropriate helper based on item type
        if (item.type === 'file' && item.file_key) {
          result = await fileHelper.delete(item.hash);
        } else {
          result = await urlHelper.delete(item.hash);
        }
        
        if (result && result.success) {
          // Reload data after successful deletion
          if (activeTab.value === 'user' && props.userId) {
            fetchUserData(userPage.value, pageSize);
          } else {
            fetchPublicData(publicPage.value, pageSize);
          }
        } else {
          console.error('Failed to delete item:', result?.error || 'Unknown error');
          alert('Failed to delete. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item. Please try again.');
      } finally {
        loading.value = false;
      }
    };
    
    // Load data when component mounts
    onMounted(() => {
      if (props.userId) {
        fetchUserData(userPage.value, pageSize);
      }
      fetchPublicData(publicPage.value, pageSize);
    });
    
    // Watch for page changes to reload data
    watch(userPage, (newPage) => {
      if (props.userId) {
        fetchUserData(newPage, pageSize);
      }
    });
    
    watch(publicPage, (newPage) => {
      fetchPublicData(newPage, pageSize);
    });
    
    return {
      loading,
      activeTab,
      userData,
      publicData,
      columns,
      displayColumns,
      userPage,
      publicPage,
      handleUserPageChange,
      handlePublicPageChange,
      formatDate,
      formatSimpleDate,
      getContentTypeDisplay,
      viewItem,
      deleteItem,
      userId: props.userId
    };
  }
};
</script>

<style scoped>
.manage-container {
  margin: 0 auto;
  padding: 2.5rem;
  background-color: var(--color-background);
  border-radius: 12px;
  box-shadow: var(--shadow-small);
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 2rem;
}

.tab {
  padding: 1rem 1.5rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
  margin-right: 0.5rem;
}

.tab:hover {
  color: var(--color-accent);
}

.tab.active {
  border-bottom: 2px solid var(--color-accent);
  color: var(--color-accent);
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 3rem;
  background-color: var(--color-border);
  border-radius: 8px;
  margin: 1.5rem 0;
  color: var(--color-text);
}

.table-container {
  overflow-x: auto;
  margin: 1.5rem 0;
}

.data-table {
  border-collapse: collapse;
  margin-bottom: 1.5rem;
  width: 100%;
}

.data-table th, .data-table td {
  padding: 1rem 0.8rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.data-table th {
  background-color: var(--color-border);
  font-weight: 600;
  color: var(--color-text);
}

.data-table tr:hover {
  background-color: var(--color-border);
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
  font-style: italic;
  background-color: var(--color-border);
  border-radius: 8px;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0 1rem;
}

.page-button {
  padding: 0.6rem 1rem;
  background-color: var(--color-border);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 0.5rem;
  color: var(--color-text);
}

.page-button:hover:not(:disabled) {
  background-color: var(--color-accent);
  color: white;
  border-color: var(--color-accent);
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  margin: 0 1rem;
  font-weight: 500;
  color: var(--color-text);
}

/* Action buttons styles */
.action-buttons {
  display: flex;
  gap: 8px;
}

.view-button, .delete-button {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.view-button {
  background-color: var(--color-accent);
  color: white;
}

.view-button:hover {
  background-color: #3a56d4;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover {
  background-color: #c82333;
}

@media (max-width: 768px) {
  .manage-container {
    padding: 1.5rem;
  }
  
  .data-table th, .data-table td {
    padding: 0.8rem 0.5rem;
    font-size: 0.9rem;
  }
  
  .view-button, .delete-button {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }

  .pagination-controls {
    margin: 1.5rem 0 0.8rem;
  }
  
  .page-button {
    padding: 0.5rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .page-info {
    font-size: 0.85rem;
  }
}

@media (max-width: 640px) {
  .manage-container {
    padding: 1.2rem;
  }
  
  .tab {
    padding: 0.7rem 1rem;
    font-size: 0.85rem;
  }
  
  /* Converting table to card view for small screens */
  .data-table {
    border: none;
    background: none;
    box-shadow: none;
  }
  
  .data-table thead {
    display: none; /* Hide table header */
  }
  
  .data-table tbody {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .data-table tr {
    display: flex;
    flex-direction: column;
    background-color: var(--color-background);
    border-radius: 8px;
    border: 1px solid var(--color-border);
    padding: 1rem;
    box-shadow: var(--shadow-small);
    position: relative;
  }
  
  .data-table td {
    display: flex;
    padding: 0.5rem 0;
    border: none;
    font-size: 0.85rem;
    position: relative;
  }
  
  /* Adding pseudo labels for mobile view */
  .data-table td:nth-child(1)::before {
    content: "Hash: ";
    font-weight: 600;
    width: 90px;
    flex-shrink: 0;
  }
  
  .data-table td:nth-child(2)::before {
    content: "Type: ";
    font-weight: 600;
    width: 90px;
    flex-shrink: 0;
  }
  
  .data-table td:nth-child(3)::before {
    content: "Description: ";
    font-weight: 600;
    width: 90px;
    flex-shrink: 0;
  }
  
  .data-table td:nth-child(4)::before {
    content: "Created: ";
    font-weight: 600;
    width: 90px;
    flex-shrink: 0;
  }
  
  .data-table td:nth-child(5)::before {
    content: "Expires: ";
    font-weight: 600;
    width: 90px;
    flex-shrink: 0;
  }
  
  .data-table .action-buttons {
    display: flex;
    justify-content: flex-end;
    padding-top: 0.8rem;
    margin-top: 0.5rem;
    border-top: 1px solid var(--color-border);
  }
  
  .data-table .action-buttons::before {
    content: "";
  }

  .empty-message {
    margin: 1.5rem 0;
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .manage-container {
    padding: 1rem;
  }
  
  .tabs {
    margin-bottom: 1.2rem;
  }
  
  .tab {
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .loading {
    padding: 2rem;
    margin: 1rem 0;
  }
  
  .data-table tr {
    padding: 0.8rem;
  }
  
  .data-table td {
    font-size: 0.8rem;
    padding: 0.4rem 0;
  }
  
  .data-table td::before {
    width: 80px;
    font-size: 0.8rem;
  }
  
  .view-button, .delete-button {
    padding: 0.35rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .pagination-controls {
    margin: 1.2rem 0 0.5rem;
  }
  
  .page-button {
    padding: 0.4rem 0.7rem;
    font-size: 0.8rem;
  }
  
  .page-info {
    font-size: 0.8rem;
  }
}
</style>