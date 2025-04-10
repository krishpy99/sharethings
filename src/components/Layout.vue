<template>
  <div class="layout">
    <Navbar />
    <main>
      <router-view :userId="userId"></router-view>
    </main>
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-section">
          <h3 class="footer-title">Share Things</h3>
          <p>A modern platform for file sharing and URL shortening with QR code generation.</p>
        </div>
        <div class="footer-section">
          <h4>Resources</h4>
          <ul class="footer-links">
            <li><router-link to="/">Home</router-link></li>
            <li><router-link to="/upload">File Upload</router-link></li>
            <li><router-link to="/text">Text to QR</router-link></li>
            <li><router-link to="/url">URL Shortener</router-link></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Support</h4>
          <ul class="footer-links">
            <li><a href="#">Documentation</a></li>
            <li><a href="#">API</a></li>
            <li><a href="#">Help & Support</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Legal</h4>
          <ul class="footer-links">
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2025 Share Things. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import Navbar from './Navbar.vue';
import { ref, onMounted } from 'vue';
import { getUserId } from '../utils/authHelper';

export default {
  name: 'Layout',
  components: {
    Navbar
  },
  setup() {
    const userId = ref(null);

    onMounted(() => {
      userId.value = getUserId();
      console.log('Layout - userId:', userId.value);
    });

    return {
      userId
    };
  }
};
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  background-color: var(--color-background);
  padding: 0;
}

.footer {
  background-color: var(--color-background);
  border-top: 1px solid var(--color-border);
  padding: 3rem 0 1.5rem;
  margin-top: 3rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  padding: 0 1rem;
}

.footer-section h3, .footer-section h4 {
  margin: 0 0 1rem 0;
  font-weight: 600;
  color: var(--color-text);
}

.footer-title {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(to right, var(--color-text), #333);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.03em;
}

:root.dark-mode .footer-title {
  background: linear-gradient(to right, var(--color-text), #ccc);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.footer-section p {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--color-accent);
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem 0;
  border-top: 1px solid var(--color-border);
  margin-top: 2rem;
  text-align: center;
}

.footer-bottom p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr 1fr;
  }
  
  .footer-section:first-child {
    grid-column: span 2;
  }
}

@media (max-width: 480px) {
  .footer-container {
    grid-template-columns: 1fr;
  }
  
  .footer-section:first-child {
    grid-column: span 1;
  }
}
</style>