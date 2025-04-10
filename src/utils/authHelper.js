import { Clerk } from '@clerk/clerk-js';

// Initialize Clerk - make sure to set this in your environment variables or .env file
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.error('VITE_CLERK_PUBLISHABLE_KEY environment variable is not defined');
}

let clerkInstance = null;
let tokenRefreshTimer = null;
const TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Initialize Clerk authentication and set up token refresh
 */
export const initializeClerk = async () => {
  if (!clerkInstance && publishableKey) {
    try {
      clerkInstance = new Clerk(publishableKey);
      await clerkInstance.load();
      console.log('Clerk initialized successfully');
      
      // Set up token refresh interval if user is signed in
      setupTokenRefresh();
    } catch (error) {
      console.error('Failed to initialize Clerk:', error);
    }
  } else if (!publishableKey) {
    console.error('Cannot initialize Clerk: Missing publishable key');
  }
  return clerkInstance;
};

/**
 * Setup periodic token refresh to ensure tokens don't expire
 */
const setupTokenRefresh = () => {
  // Clear any existing timer
  if (tokenRefreshTimer) {
    clearInterval(tokenRefreshTimer);
  }
  
  // Set up new timer for token refresh
  tokenRefreshTimer = setInterval(async () => {
    if (clerkInstance && clerkInstance.session) {
      try {
        // Refresh the token
        await clerkInstance.session.refresh();
        console.log('Auth token refreshed successfully');
      } catch (error) {
        console.error('Failed to refresh auth token:', error);
      }
    }
  }, TOKEN_REFRESH_INTERVAL);
};

/**
 * Get the current user ID
 */
export const getUserId = () => {
  if (clerkInstance && clerkInstance.user) {
    return clerkInstance.user.id;
  }
  return null;
};

/**
 * Get the current user details
 */
export const getUserDetails = () => {
  if (clerkInstance && clerkInstance.user) {
    return {
      id: clerkInstance.user.id,
      firstName: clerkInstance.user.firstName,
      lastName: clerkInstance.user.lastName,
      email: clerkInstance.user.primaryEmailAddress?.emailAddress,
      imageUrl: clerkInstance.user.imageUrl,
      username: clerkInstance.user.username,
      fullName: `${clerkInstance.user.firstName || ''} ${clerkInstance.user.lastName || ''}`.trim() || 'User'
    };
  }
  return null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!(clerkInstance && clerkInstance.user);
};

/**
 * Open sign in dialog
 */
export const signIn = async () => {
  if (clerkInstance) {
    await clerkInstance.openSignIn();
    
    // Set up token refresh after sign in
    if (isAuthenticated()) {
      setupTokenRefresh();
    }
  }
};

/**
 * Open sign up dialog
 */
export const signUp = async () => {
  if (clerkInstance) {
    await clerkInstance.openSignUp();
    
    // Set up token refresh after sign up
    if (isAuthenticated()) {
      setupTokenRefresh();
    }
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  if (clerkInstance) {
    await clerkInstance.signOut();
    
    // Clear token refresh timer on sign out
    if (tokenRefreshTimer) {
      clearInterval(tokenRefreshTimer);
      tokenRefreshTimer = null;
    }
  }
};

/**
 * Get authentication headers with bearer token
 */
export const getAuthHeader = async () => {
  if (clerkInstance && clerkInstance.session) {
    const token = await clerkInstance.session.getToken();
    return {
      'Authorization': `Bearer ${token}`
    };
  }
  return {};
};

/**
 * Get the current auth token (useful for debugging)
 */
export const getCurrentToken = () => {
  if (clerkInstance && clerkInstance.session) {
    return clerkInstance.session.getToken();
  }
  return null;
};

/**
 * Force refresh the auth token
 */
export const refreshToken = async () => {
  if (clerkInstance && clerkInstance.session) {
    try {
      await clerkInstance.session.refresh();
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }
  return false;
};

export default {
  initializeClerk,
  getUserId,
  getUserDetails,
  isAuthenticated,
  signIn,
  signUp,
  signOut,
  getAuthHeader,
  refreshToken,
  getCurrentToken,
};