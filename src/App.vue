<template>
  <v-app :theme="uiStore.theme">
    <v-main>
      <v-container fluid class="pa-4">
        <v-row justify="center" class="ma-0">
          <!-- Left Column: Feed List -->
          <v-col cols="12" md="4" lg="3" class="pa-2">
            <v-sheet elevation="2" rounded class="pa-4 feed-list-sticky">
              <FeedList />
            </v-sheet>
          </v-col>

          <!-- Right Column: Content View -->
          <v-col cols="12" md="8" lg="9" class="pa-2">
            <v-sheet elevation="2" rounded class="pa-4">
              <ContentView />
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from 'vuetify'
import FeedList from './components/FeedList.vue'
import ContentView from './components/ContentView.vue'
import { useFeedStore } from './stores/feedStore'
import { useUIStore } from './stores/uiStore'
import * as storage from './utils/storage'

const feedStore = useFeedStore()
const uiStore = useUIStore()
const theme = useTheme()

onMounted(async () => {
  try {
    // Initialize database
    await storage.initDB()

    // Load UI preferences
    await uiStore.loadPreferences()

    // Apply theme
    theme.global.name.value = uiStore.theme

    // Load feeds from storage
    await feedStore.loadFeedsFromStorage()
  } catch (error) {
    console.error('Failed to initialize app:', error)
  }
})
</script>

<style scoped>
.v-container {
  max-width: 1400px;
}

.feed-list-sticky {
  position: sticky;
  top: 1.5rem;
  max-height: calc(100vh - 1rem);
  overflow-y: auto;
}
</style>
