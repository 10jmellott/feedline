import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as storage from '@/utils/storage'

export type ViewMode = 'list' | 'grid'

export const useUIStore = defineStore('ui', () => {
  const viewMode = ref<ViewMode>('list')
  const theme = ref<'light' | 'dark'>('light')

  async function loadPreferences() {
    try {
      const savedViewMode = await storage.getSetting('viewMode')
      const savedTheme = await storage.getSetting('theme')

      if (savedViewMode) {
        viewMode.value = savedViewMode
      }

      if (savedTheme) {
        theme.value = savedTheme
      }
    } catch (err) {
      console.error('Failed to load UI preferences:', err)
    }
  }

  async function setViewMode(mode: ViewMode) {
    viewMode.value = mode
    await storage.setSetting('viewMode', mode)
  }

  async function toggleTheme() {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    theme.value = newTheme
    await storage.setSetting('theme', newTheme)
  }

  async function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
    await storage.setSetting('theme', newTheme)
  }

  return {
    viewMode,
    theme,
    loadPreferences,
    setViewMode,
    toggleTheme,
    setTheme
  }
})
