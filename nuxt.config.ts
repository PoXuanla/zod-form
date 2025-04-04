// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/ui"],

  typescript: {
    strict: true,
  },

  compatibilityDate: "2025-03-31",
});