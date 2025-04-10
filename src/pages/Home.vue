<template>
  <div class="home">
    <section class="hero">
      <div class="hero-content">
        <h1>Share Everything<br><span>Simply & Fastly</span></h1>
        <p class="tagline">The modern platform for QR file sharing, text encoding, and URL shortening.</p>
        
        <div class="cta-buttons">
          <router-link to="/upload" class="cta-primary">Start Uploading</router-link>
          <router-link to="/url" class="cta-secondary">Shorten URL</router-link>
        </div>
      </div>
      
      <div class="hero-visual">
        <div class="file-animation">
          <div class="file file-1">
            <div class="file-icon">📄</div>
            <div class="file-label">doc.pdf</div>
          </div>
          <div class="file file-2">
            <div class="file-icon">🖼️</div>
            <div class="file-label">image.png</div>
          </div>
          <div class="file file-3">
            <div class="file-icon">📊</div>
            <div class="file-label">data.xlsx</div>
          </div>
          <div class="laptop-background">
            <div class="laptop-icon">💻</div>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <h2 class="section-title">Features</h2>
      
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">📁</div>
          <h3>File Sharing</h3>
          <p>Upload and share files securely with auto-expiring links and QR codes.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🔗</div>
          <h3>URL Shortener</h3>
          <p>Create compact, shareable links that redirect to your original URLs.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <h3>QR Generator</h3>
          <p>Convert text, URLs or files into scannable QR codes for easy sharing.</p>
        </div>
        
        <!-- <div class="feature-card">
          <div class="feature-icon">🔒</div>
          <h3>Secure & Private</h3>
          <p>All uploads and shortened URLs are encrypted and expire automatically.</p>
        </div> -->
      </div>
    </section>
    
    <section class="get-started">
      <h2>Ready to start sharing?</h2>
      <p>No account required. Start using our tools immediately.</p>
      <div class="start-buttons">
        <router-link to="/upload" class="start-button">Upload Files</router-link>
        <router-link to="/text" class="start-button">Create QR Code</router-link>
        <router-link to="/url" class="start-button">Shorten URL</router-link>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "Home",
  props: {
    userId: {
      type: String,
      default: null
    }
  },
  mounted() {
    console.log('Home - userId:', this.userId);
  }
};
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 0 4rem;
  gap: 2rem;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

h1 {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.05em;
  background: linear-gradient(to right, var(--color-text), #333);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

h1 span {
  background: linear-gradient(to right, #0070f3, #00a1ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline;
}

.tagline {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
}

.cta-primary, .cta-secondary {
  display: inline-block;
  padding: 0.8rem 1.8rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.cta-primary {
  background: var(--color-text);
  color: var(--color-background);
  border: 1px solid transparent;
}

.cta-primary:hover {
  background: var(--color-text-secondary);
  transform: translateY(-2px);
}

.cta-secondary {
  border: 1px solid var(--color-border);
  color: var(--color-accent);
}

.cta-secondary:hover {
  border-color: var(--color-accent);
  background-color: rgba(0, 112, 243, 0.05);
  transform: translateY(-2px);
}

.hero-visual {
  flex: 1;
  max-width: 550px;
  place-items: center;
  align-items: center;
  display: flex;
  margin-top: 10rem;
}

.file-animation {
  position: relative;
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  perspective: 1000px;
}

.file {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-border);
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  box-shadow: var(--shadow-small);
  transition: transform 0.3s ease;
  animation-duration: 4s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.file-1 {
  animation-name: moveFile1;
  z-index: 3;
}

.file-2 {
  animation-name: moveFile2;
  z-index: 2;
}

.file-3 {
  animation-name: moveFile3;
  z-index: 1;
}

.laptop-background {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #0070f3, #00a1ff);
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 113, 243, 0.3);
  z-index: 4;
}

.laptop-icon {
  font-size: 4rem;
}

@keyframes moveFile1 {
  0% { transform: translate(-100px, 40px) rotate(-5deg); opacity: 0.7; }
  25% { transform: translate(0px, 0px) rotate(0deg); opacity: 1; }
  50% { transform: translate(100px, -30px) rotate(5deg); opacity: 0.9; }
  75% { transform: translate(50px, -60px) scale(0.8); opacity: 0.7; }
  100% { transform: translate(-100px, 40px) rotate(-5deg); opacity: 0.7; }
}

@keyframes moveFile2 {
  0% { transform: translate(80px, 20px) rotate(5deg); opacity: 0.7; }
  25% { transform: translate(30px, -40px) rotate(-2deg); opacity: 0.9; }
  50% { transform: translate(-60px, -10px) rotate(-8deg); opacity: 1; }
  75% { transform: translate(-30px, 50px) scale(0.9); opacity: 0.8; }
  100% { transform: translate(80px, 20px) rotate(5deg); opacity: 0.7; }
}

@keyframes moveFile3 {
  0% { transform: translate(20px, -60px) rotate(-3deg); opacity: 0.8; }
  25% { transform: translate(-50px, -20px) rotate(2deg); opacity: 0.7; }
  50% { transform: translate(-20px, 60px) rotate(8deg); opacity: 0.9; }
  75% { transform: translate(60px, 30px) scale(0.85); opacity: 1; }
  100% { transform: translate(20px, -60px) rotate(-3deg); opacity: 0.8; }
}

@keyframes pulseQR {
  0% { transform: scale(0.9); box-shadow: 0 4px 8px rgba(0, 113, 243, 0.3); }
  50% { transform: scale(1.1); box-shadow: 0 12px 24px rgba(0, 113, 243, 0.5); }
  100% { transform: scale(0.9); box-shadow: 0 4px 8px rgba(0, 113, 243, 0.3); }
}

.features {
  padding: 4rem 0;
  border-top: 1px solid var(--color-border);
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  letter-spacing: -0.03em;
  color: var(--color-text);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: var(--color-background);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: var(--shadow-small);
  transition: all 0.3s ease;
  border: 1px solid var(--color-border);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-medium);
  border-color: var(--color-border);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.feature-card h3 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.feature-card p {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.get-started {
  text-align: center;
  padding: 5rem 0;
  border-top: 1px solid var(--color-border);
}

.get-started h2 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: -0.03em;
  color: var(--color-text);
}

.get-started p {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.start-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.start-button {
  display: inline-block;
  padding: 0.8rem 1.8rem;
  border-radius: 8px;
  background: var(--color-border);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
}

.start-button:hover {
  background: var(--color-border);
  transform: translateY(-2px);
}

@media (max-width: 900px) {
  .hero {
    flex-direction: column;
    padding: 1.5rem 0 3rem;
  }
  
  h1 {
    font-size: 2.5rem;
  }
  
  .hero-visual {
    order: -1;
    margin-bottom: 1rem;
  }
  
  .feature-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
  
  .cta-buttons {
    flex-direction: column;
    max-width: 100%;
  }
  
  .cta-primary, .cta-secondary {
    width: 100%;
    text-align: center;
  }
  
  .start-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .start-button {
    width: 100%;
    max-width: 300px;
    text-align: center;
  }
}
</style>