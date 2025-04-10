<script>
export default {
  name: 'App'
}
</script>

<template>
  <router-view></router-view>
</template>

<style>
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
  background-color: var(--color-background);
  color: var(--color-text);
}

* {
  box-sizing: border-box;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

button {
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.8em 1.6em;
  margin: 0.8em 0;
  background-color: var(--color-accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
}

button:hover {
  opacity: 0.9;
}

input, textarea, select {
  padding: 0.8em 1em;
  margin: 0.8em 0;
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

input:focus, button:focus, textarea:focus, select:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.card {
  background-color: var(--color-background);
  border-radius: 12px;
  box-shadow: var(--shadow-small);
  padding: 2rem;
  margin: 1.5rem 0;
  border: 1px solid var(--color-border);
}

.container {
  margin: 0 auto;
  padding: 0 1.5rem;
}

.text-center {
  text-align: center;
}

.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }
.mb-3 { margin-bottom: 1.5rem; }
.mb-4 { margin-bottom: 2rem; }

.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.mt-3 { margin-top: 1.5rem; }
.mt-4 { margin-top: 2rem; }

.py-1 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.py-2 { padding-top: 1rem; padding-bottom: 1rem; }
.py-3 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.py-4 { padding-top: 2rem; padding-bottom: 2rem; }

.px-1 { padding-left: 0.5rem; padding-right: 0.5rem; }
.px-2 { padding-left: 1rem; padding-right: 1rem; }
.px-3 { padding-left: 1.5rem; padding-right: 1.5rem; }
.px-4 { padding-left: 2rem; padding-right: 2rem; }
</style>
