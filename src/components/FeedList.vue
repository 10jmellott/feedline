<template>
  <div>
    <h3 class="text-h4 mb-3 d-flex align-center ga-2">
      <FeedlineLogo height="36px" width="36px" />
      eedline
    </h3>

    <AddFeedDialog />

    <v-btn
      v-if="feedStore.feeds.length > 0"
      variant="outlined"
      block
      class="mb-4"
      :loading="feedStore.isLoading"
      @click="refreshAll"
    >
      <v-icon left>mdi-refresh</v-icon>
      Refresh All
    </v-btn>

    <v-list v-if="feedStore.feeds.length > 0" density="compact">
      <FeedItem
        v-for="feed in feedStore.feeds"
        :key="feed.url"
        :feed="feed"
        :is-selected="feedStore.selectedFeedUrl === feed.url"
        @select="selectFeed(feed.url)"
        @delete="deleteFeed(feed.url)"
      />
    </v-list>

    <v-alert v-else type="info" variant="tonal" class="mt-4">
      No feeds yet. Click "Add Feed" to get started.
    </v-alert>

    <v-btn
      block
      variant="outlined"
      class="mt-4"
      @click="uiStore.toggleTheme()"
    >
      <v-icon left>{{ uiStore.theme === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
      {{ uiStore.theme === 'light' ? 'Dark Mode' : 'Light Mode' }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { useFeedStore } from '@/stores/feedStore'
import { useUIStore } from '@/stores/uiStore'
import AddFeedDialog from './AddFeedDialog.vue'
import FeedItem from './FeedItem.vue'
import FeedlineLogo from './FeedlineLogo.vue'

const feedStore = useFeedStore()
const uiStore = useUIStore()

function selectFeed(feedUrl: string) {
  feedStore.selectFeed(feedUrl)
}

async function deleteFeed(feedUrl: string) {
  if (confirm('Are you sure you want to delete this feed?')) {
    await feedStore.removeFeed(feedUrl)
  }
}

async function refreshAll() {
  await feedStore.refreshAllFeeds()
}
</script>
