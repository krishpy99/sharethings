import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { initializeClerk } from './utils/authHelper'

// Initialize Clerk authentication
initializeClerk()
  .then(() => {
    // Create and mount the app after Clerk is initialized
    const app = createApp(App)
    app.use(router)
    app.mount('#app')
  })
  .catch(error => {
    console.error('Failed to initialize Clerk:', error)
    // Create and mount the app anyway to ensure the app loads even if Clerk fails
    const app = createApp(App)
    app.use(router)
    app.mount('#app')
  })
