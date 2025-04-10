<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="nav-brand">
        <router-link to="/" custom v-slot="{ href, navigate, isExactActive }">
          <a :href="href" @click="navigate" class="nav-link"><h1>Share Things</h1></a>
        </router-link>
      </div>
      
      <!-- Mobile menu button -->
      <button @click="toggleMobileMenu" class="mobile-menu-button">
        <svg v-if="!mobileMenuOpen" class="menu-icon" viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
        </svg>
        <svg v-else class="menu-icon" viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
        </svg>
      </button>
      
      <!-- Desktop navigation -->
      <div class="nav-links desktop-nav">
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
      
      <div class="nav-actions desktop-nav">
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

    <!-- Mobile side drawer -->
    <div class="mobile-side-drawer" :class="{'open': mobileMenuOpen}">
      <div class="mobile-drawer-content">
        <div class="mobile-nav-links">
          <router-link @click="closeMobileMenu" to="/upload" custom v-slot="{ href, navigate, isExactActive }">
            <a :href="href" @click="navigate" class="mobile-nav-link" :class="{'active': isExactActive}">Upload File</a>
          </router-link>
          <router-link @click="closeMobileMenu" to="/text" custom v-slot="{ href, navigate, isExactActive }">
            <a :href="href" @click="navigate" class="mobile-nav-link" :class="{'active': isExactActive}">Text to QR</a>
          </router-link>
          <router-link @click="closeMobileMenu" to="/url" custom v-slot="{ href, navigate, isExactActive }">
            <a :href="href" @click="navigate" class="mobile-nav-link" :class="{'active': isExactActive}">URL Shortener</a>
          </router-link>
          <router-link @click="closeMobileMenu" to="/manage" custom v-slot="{ href, navigate, isExactActive }">
            <a :href="href" @click="navigate" class="mobile-nav-link" :class="{'active': isExactActive}">Manage Files</a>
          </router-link>
        </div>
        
        <div class="mobile-search">
          <input 
            v-model="fileHash" 
            placeholder="Enter file hash..." 
            class="mobile-search-input"
          />
          <button @click="mobileViewFile" class="mobile-search-button">View</button>
        </div>
        
        <div class="mobile-drawer-actions">
          <div class="mobile-theme-toggle">
            <button @click="toggleDarkMode" class="mobile-theme-button">
              <svg v-if="isDarkMode" class="theme-icon" viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0 c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2 c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1 S11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0 s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06 c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41 c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36 c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z" />
              </svg>
              <svg v-else class="theme-icon" viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36c-0.98,1.37-2.58,2.26-4.4,2.26 c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z" />
              </svg>
              <span>{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
            </button>
          </div>
          
          <div class="mobile-auth-buttons" v-if="!isAuthenticated">
            <button @click="handleSignIn" class="mobile-auth-button sign-in">Sign In</button>
            <button @click="handleSignUp" class="mobile-auth-button sign-up">Sign Up</button>
          </div>
          
          <div class="mobile-user-profile" v-else>
            <div class="mobile-user-info">
              <div v-if="userDetails?.imageUrl" class="mobile-user-image">
                <img :src="userDetails.imageUrl" alt="Profile" />
              </div>
              <div v-else class="mobile-user-avatar">{{ userInitials }}</div>
              <div class="mobile-user-details">
                <div class="mobile-user-name">{{ userDetails?.fullName }}</div>
                <div class="mobile-user-email">{{ userDetails?.email }}</div>
              </div>
            </div>
            <button @click="handleSignOut" class="mobile-auth-button sign-out">Sign Out</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay when side drawer is open -->
    <div 
      v-if="mobileMenuOpen" 
      class="mobile-overlay" 
      @click="closeMobileMenu">
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
    const mobileMenuOpen = ref(false);

    // Check authentication status on mount
    onMounted(() => {
      checkAuthStatus();
      document.addEventListener('click', handleOutsideClick);
      initTheme();
      
      // Add event listener to close mobile menu when escape key is pressed
      document.addEventListener('keydown', handleEscapeKey);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
    });

    // Handle escape key press to close mobile menu
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && mobileMenuOpen.value) {
        closeMobileMenu();
      }
    };

    // Toggle mobile menu
    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value;
      
      // Prevent body scrolling when menu is open
      if (mobileMenuOpen.value) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    };

    // Close mobile menu
    const closeMobileMenu = () => {
      mobileMenuOpen.value = false;
      document.body.style.overflow = '';
    };

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

    // Mobile view file function - also closes the mobile menu
    const mobileViewFile = async () => {
      await viewFile();
      closeMobileMenu();
    };

    const closeFileViewer = () => {
      showFileViewer.value = false;
      fileHash.value = '';
    };

    const handleSignIn = async () => {
      await signIn();
      checkAuthStatus();
      closeMobileMenu();
    };

    const handleSignUp = async () => {
      await signUp();
      checkAuthStatus();
      closeMobileMenu();
    };

    const handleSignOut = async () => {
      await signOut();
      authenticated.value = false;
      userId.value = null;
      userDetails.value = null;
      showProfileMenu.value = false;
      closeMobileMenu();
    };

    return {
      fileHash,
      showFileViewer,
      viewFile,
      mobileViewFile,
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
      toggleDarkMode,
      mobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu
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

/* Mobile menu button */
.mobile-menu-button {
  display: none;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 0.5rem;
  z-index: 150;
}

.menu-icon {
  width: 24px;
  height: 24px;
}

/* Mobile side drawer styles */
.mobile-side-drawer {
  position: fixed;
  top: 0;
  right: -300px; /* Start offscreen */
  width: 280px;
  height: 100vh;
  background-color: var(--color-background);
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 200;
  transition: right 0.3s ease;
  overflow-y: auto;
}

.mobile-side-drawer.open {
  right: 0;
}

.mobile-drawer-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 3rem;
  margin-bottom: 2rem;
}

.mobile-nav-link {
  color: var(--color-text);
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  display: block;
}

.mobile-nav-link:hover {
  background-color: var(--color-border);
}

.mobile-nav-link.active {
  font-weight: 600;
  background-color: var(--color-border);
}

.mobile-search {
  margin: 1rem 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-search-input {
  padding: 0.8rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  background-color: var(--color-background);
  color: var(--color-text);
}

.mobile-search-button {
  padding: 0.8rem 1rem;
  background-color: var(--color-text);
  color: var(--color-background);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
}

.mobile-drawer-actions {
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
}

.mobile-theme-toggle {
  margin-bottom: 1.5rem;
}

.mobile-theme-button {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 1rem;
  padding: 0.8rem 1rem;
  cursor: pointer;
  width: 100%;
  text-align: left;
  border-radius: 8px;
}

.mobile-theme-button:hover {
  background-color: var(--color-border);
}

.mobile-auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.mobile-auth-button {
  padding: 0.8rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  width: 100%;
}

.mobile-user-profile {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 0;
}

.mobile-user-image img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.mobile-user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #333;
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.mobile-user-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.mobile-user-name {
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-text);
}

.mobile-user-email {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

/* Overlay that appears when mobile menu is open */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 150;
  backdrop-filter: blur(2px);
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

/* Media queries for responsive design */
@media (max-width: 1100px) {
  .navbar-container {
    flex-wrap: wrap;
    padding: 1rem;
  }
}

/* Media query for tablet/mobile */
@media (max-width: 900px) {
  .desktop-nav {
    display: none;
  }
  
  .mobile-menu-button {
    display: flex;
  }
  
  .navbar-container {
    justify-content: space-between;
    padding: 0.8rem 1rem;
  }
}

/* Older styles kept for compatibility */
@media (max-width: 1100px) {
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