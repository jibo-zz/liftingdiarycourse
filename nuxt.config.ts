// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // REMOVE '@nuxtjs/tailwindcss' from this array
  modules: ['@clerk/nuxt', '@nuxt/eslint', '@nuxt/ui'], 

  css: ['~/assets/css/main.css'],
  
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {}, 
    },
  },
  
  vite: {
    optimizeDeps: {
      exclude: ['@clerk/vue']
    }
  }
})