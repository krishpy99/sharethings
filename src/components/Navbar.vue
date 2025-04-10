<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="nav-brand">
        <router-link to="/" custom v-slot="{ href, navigate, isExactActive }">
          <a :href="href" @click="navigate" class="nav-link"><h1>Share Things</h1></a>
        </router-link>
      </div>
      
      <div class="nav-links">
        <router-link to="/upload" custom v-slot="{ href, navigate, isExactActive }">
          <a :href="href" @click="navigate" class="nav-link" :class="{'active': isExactActive}">Upload File</a>
        </router-link>
        <router-link to="/text" custom v-slot="{ href, navigate, isExactActive }">
          <a :href="href" @click="navigate" class="nav-link" :class="{'active': isExactActive}">Text to QR</a>
        </router-link>
        <router-link to="/url" custom v-slot="{ href, navigate, isExactActive }">
          <a :href="href" @click="navigate" class="nav-link" :class="{'active': isExactActive}">URL Shortener</a>
        </router-link>
        <router-link to="/manage" custom v-slot="{ href, navigate, isExactActive }">
          <a :href="href" @click="navigate" class="nav-link" :class="{'active': isExactActive}">Manage Files</a>
        </router-link>
      </div>
      
      <div class="nav-actions">
        <div class="search-container">
          <input 
            v-model="fileHash" 
            placeholder="Enter file hash..." 
            class="search-input"
          />
          <button @click="viewFile" class="search-button">View</button>
        </div>
        
        <div class="theme-toggle">
          <button @click="toggleDarkMode" class="theme-toggle-button" :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            <svg v-if="isDarkMode" class="theme-icon" viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0 c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2 c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1 S11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0 s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06 c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41 c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36 c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z" />
            </svg>
            <svg v-else class="theme-icon" viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36c-0.98,1.37-2.58,2.26-4.4,2.26 c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z" />
            </svg>
          </button>
        </div>
        
        <div class="auth-buttons" v-if="!isAuthenticated">
          <button @click="handleSignIn" class="auth-button sign-in">Sign In</button>
          <button @click="handleSignUp" class="auth-button sign-up">Sign Up</button>
        </div>
        <div class="user-profile" v-else>
          <button @click="toggleProfileMenu" class="profile-button">
            <img v-if="userDetails?.imageUrl" :src="userDetails.imageUrl" alt="Profile" class="profile-image" />
          </button>
          <div v-if="showProfileMenu" class="profile-menu">
            <div class="profile-menu-header">
              <div class="profile-details">
                <img v-if="userDetails?.imageUrl" :src="userDetails.imageUrl" alt="Profile" class="profile-details-image" />
                <div v-else class="profile-details-avatar">{{ userInitials }}</div>
                <div class="profile-info">
                  <div class="profile-fullname">{{ userDetails?.fullName }}</div>
                  <div class="profile-email">{{ userDetails?.email }}</div>
                </div>
              </div>
            </div>
            <div class="profile-menu-items">
              <button @click="handleSignOut" class="profile-menu-item">Sign Out</button>
            </div>
          </div>
          <button @click="handleSignOut" class="auth-button sign-out">Sign Out</button>
        </div>
      </div>
    </div>

    <!-- File Viewer Modal -->
    <div v-if="showFileViewer" class="modal-overlay">
      <div class="modal-content">
        <button @click="closeFileViewer" class="close-button">&times;</button>
        <FileViewer ref="fileViewer" :initialHash="fileHash" />
      </div>
    </div>
  </nav>
</template>

<script>
import FileViewer from './FileViewer.vue';
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { isAuthenticated, signIn, signUp, signOut, getUserId, getUserDetails } from '../utils/authHelper';
import { pgHelper } from '../utils/pgHelper';

export default {
  name: 'Navbar',
  components: {
    FileViewer
  },
  setup() {
    const fileHash = ref('');
    const showFileViewer = ref(false);
    const fileViewer = ref(null);
    const authenticated = ref(false);
    const userId = ref(null);
    const userDetails = ref(null);
    const showProfileMenu = ref(false);
    const isDarkMode = ref(false);

    // Check authentication status on mount
    onMounted(() => {
      checkAuthStatus();
      document.addEventListener('click', handleOutsideClick);
      initTheme();
    });

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleOutsideClick);
    });

    // Initialize theme based on localStorage or system preference
    const initTheme = () => {
      // Check localStorage first
      const savedTheme = localStorage.getItem('theme');
      
      if (savedTheme) {
        // Apply saved theme preference
        isDarkMode.value = savedTheme === 'dark';
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        isDarkMode.value = prefersDark;
      }
      
      // Apply theme
      applyTheme();
    };

    // Toggle dark mode
    const toggleDarkMode = () => {
      // Add transition class
      document.documentElement.classList.add('color-theme-in-transition');
      
      // Toggle dark mode
      isDarkMode.value = !isDarkMode.value;
      
      // Apply theme
      applyTheme();
      
      // Save preference to localStorage
      localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
      
      // Remove transition class after animation completes
      setTimeout(() => {
        document.documentElement.classList.remove('color-theme-in-transition');
      }, 500);
    };

    // Apply current theme to document
    const applyTheme = () => {
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
    };

    // Handle clicks outside the profile menu to close it
    const handleOutsideClick = (event) => {
      if (showProfileMenu.value && !event.target.closest('.user-profile')) {
        showProfileMenu.value = false;
      }
    };

    // Toggle profile menu
    const toggleProfileMenu = () => {
      showProfileMenu.value = !showProfileMenu.value;
    };

    // Check auth status and get user info
    const checkAuthStatus = async () => {
      authenticated.value = isAuthenticated();
      if (authenticated.value) {
        userId.value = getUserId();
        userDetails.value = getUserDetails();
      }
    };

    // Get user initials for avatar
    const userInitials = computed(() => {
      if (!userDetails.value) return '';
      const first = userDetails.value.firstName?.[0] || '';
      const last = userDetails.value.lastName?.[0] || '';
      return (first + last).toUpperCase() || userDetails.value.email?.[0]?.toUpperCase() || 'U';
    });

    const username = computed(() => {
      return userId.value ? `User: ${userId.value.substring(0, 8)}...` : '';
    });

    const viewFile = async () => {
      if (fileHash.value.trim()) {
        try {
          // Check the hash type using pgHelper
          const result = await pgHelper.checkHashType(fileHash.value.trim());

          if (!result.success) {
            throw new Error('Failed to check hash type');
          }
          console.log('Hash type result:', result);
          // Handle based on hash type
          if (result.type === 'url') {
            // Redirect to the shortened URL
            window.location.href = `/r/${fileHash.value.trim()}`;
          } else if (result.type === 'file') {
            // Show file viewer modal for files
            showFileViewer.value = true;
          } else {
            alert('Invalid or expired hash');
          }
        } catch (error) {
          console.error('Error checking hash:', error);
          alert('Error processing your request. Please try again.');
        }
      }
    };

    const closeFileViewer = () => {
      showFileViewer.value = false;
      fileHash.value = '';
    };

    const handleSignIn = async () => {
      await signIn();
      checkAuthStatus();
    };

    const handleSignUp = async () => {
      await signUp();
      checkAuthStatus();
    };

    const handleSignOut = async () => {
      await signOut();
      authenticated.value = false;
      userId.value = null;
      userDetails.value = null;
      showProfileMenu.value = false;
    };

    return {
      fileHash,
      showFileViewer,
      viewFile,
      closeFileViewer,
      fileViewer,
      isAuthenticated: computed(() => authenticated.value),
      username,
      userDetails,
      userInitials,
      showProfileMenu,
      toggleProfileMenu,
      handleSignIn,
      handleSignUp,
      handleSignOut,
      isDarkMode,
      toggleDarkMode
    };
  }
};
</script>

<style scoped>
.navbar {
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  padding: 0.8rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(to right, var(--color-text), #333);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.03em;
}

:root.dark-mode .nav-brand h1 {
  background: linear-gradient(to right, var(--color-text), #ccc);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: 1.2rem;
}

.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s ease;
  position: relative;
  padding: 0.5rem 0;
}

.nav-link:hover {
  color: var(--color-text);
}

.nav-link.active {
  color: var(--color-text);
  font-weight: 600;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--color-text);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-container {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.4rem;
  overflow: hidden;
}

.search-input {
  padding: 0.6rem 1rem;
  border: none;
  font-size: 0.9rem;
  background: transparent;
  width: 180px;
  margin: 0;
  color: var(--color-text);
}

.search-input:focus {
  outline: none;
  box-shadow: none;
}

.search-button {
  padding: 0.6rem 1rem;
  background-color: var(--color-text);
  color: var(--color-background);
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  margin: 0;
  transition: background-color 0.2s ease;
}

.search-button:hover {
  background-color: var(--color-text-secondary);
}

.auth-buttons {
  display: flex;
  gap: 0.5rem;
}

.auth-button {
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.sign-in {
  background-color: transparent;
  border: 1px solid var(--color-text);
  color: var(--color-text);
}

.sign-in:hover {
  background-color: rgba(var(--color-text), 0.05);
}

.sign-up {
  background-color: var(--color-text);
  color: var(--color-background);
}

.sign-up:hover {
  background-color: var(--color-text-secondary);
}

.sign-out {
  background-color: #f2f2f2;
  color: #666;
  display: none; /* Hide the sign-out button since we now have it in the profile menu */
}

.sign-out:hover {
  background-color: #e0e0e0;
  color: #333;
}

.user-profile {
  display: flex;
  align-items: center;
  position: relative;
}

.profile-button {
  display: flex;
  align-items: center;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 100%;
  padding: 0.3rem 0.3rem 0.3rem 0.3rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.profile-button:hover {
  background-color: var(--color-border);
}

.profile-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #333;
  color: white;
  font-weight: 600;
  font-size: 0.8rem;
}

.profile-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background-color: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 200;
  overflow: hidden;
  animation: fade-in 0.2s ease-out;
}

.profile-menu-header {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.profile-details {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.profile-details-image {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-details-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #333;
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.profile-fullname {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text);
}

.profile-email {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.profile-menu-items {
  padding: 0.5rem;
}

.profile-menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.8rem 1rem;
  border: none;
  background: none;
  font-size: 0.9rem;
  color: var(--color-text);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.profile-menu-item:hover {
  background-color: var(--color-border);
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.username {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-content {
  background-color: var(--color-background);
  width: 90%;
  height: 85%;
  border-radius: 12px;
  position: relative;
  padding: 2rem;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slide-up 0.3s ease-out;
}

.close-button {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text);
  border-radius: 10px;
  max-width: 10px;
  max-height: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-button:hover {
  color: #ffffff;
  background-color: #dd0000;
  opacity: 0.8;
}

/* Theme toggle button styles */
.theme-toggle {
  display: flex;
  align-items: center;
}

.theme-toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--color-text);
  transition: all 0.2s ease;
}

.theme-toggle-button:hover {
  background-color: var(--color-border);
  transform: none;
  box-shadow: none;
}

.theme-icon {
  height: 24px;
  width: 24px;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Make responsive for smaller screens */
@media (max-width: 1100px) {
  .navbar-container {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .nav-links {
    justify-content: center;
    flex-wrap: wrap;
    margin: 0.5rem 0;
    gap: 0.8rem;
  }
  
  .nav-actions {
    width: 100%;
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .search-container {
    width: 100%;
    max-width: 400px;
  }

  .search-input {
    flex: 1;
  }
  
  .auth-buttons {
    width: 100%;
    max-width: 400px;
    justify-content: space-between;
  }
  
  .user-profile {
    width: 100%;
    max-width: 400px;
    justify-content: space-between;
  }

  .profile-menu {
    width: 100%;
    max-width: 400px;
  }
}
</style>