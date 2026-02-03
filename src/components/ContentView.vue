<template>
  <div>
    <v-toolbar density="compact" color="transparent" flat v-if="feedStore.selectedFeed">
      <v-avatar size="32" class="mr-3">
        <v-img v-if="feedStore.selectedFeed.favicon" :src="feedStore.selectedFeed.favicon" :alt="feedStore.selectedFeed.title">
          <template v-slot:error>
            <v-icon>mdi-rss</v-icon>
          </template>
        </v-img>
        <v-icon v-else>mdi-rss</v-icon>
      </v-avatar>
      <v-toolbar-title><span v-html="feedStore.selectedFeed.title"></span></v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn
        icon
        size="small"
        :loading="feedStore.isLoading"
        @click="refreshFeed"
        title="Refresh feed"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>

      <v-btn-toggle
        v-model="viewMode"
        mandatory
        density="compact"
        class="ml-2"
      >
        <v-btn value="list" size="small">
          <v-icon>mdi-view-list</v-icon>
        </v-btn>
        <v-btn value="grid" size="small">
          <v-icon>mdi-view-grid</v-icon>
        </v-btn>
      </v-btn-toggle>
    </v-toolbar>

    <!-- Loading state -->
    <div v-if="feedStore.isLoading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Error state -->
    <v-alert v-else-if="feedStore.error" type="error" class="ma-4">
      {{ feedStore.error }}
    </v-alert>

    <!-- No feed selected -->
    <v-alert v-else-if="!feedStore.selectedFeed" type="info" variant="tonal" class="ma-4">
      <div class="text-center">
        <v-icon size="64" class="mb-4">mdi-rss</v-icon>
        <h3 class="text-h5 mb-2">Welcome to Feedline</h3>
        <p>Select a feed from the left to view its entries, or add a new feed to get started.</p>
      </div>
    </v-alert>

    <!-- No entries in feed -->
    <v-alert v-else-if="feedStore.selectedFeedEntries.length === 0" type="info" variant="tonal" class="ma-4">
      No entries in this feed yet. Try refreshing.
    </v-alert>

    <!-- Grid view -->
    <v-row v-else-if="viewMode === 'grid'" class="mt-4">
      <v-col
        v-for="entry in feedStore.selectedFeedEntries"
        :key="entry.id || entry.guid"
        cols="12"
        md="6"
        lg="4"
      >
        <EntryCard :entry="entry" />
      </v-col>
    </v-row>

    <!-- List view -->
    <div v-else class="mt-4">
      <EntryList :entries="feedStore.selectedFeedEntries" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFeedStore } from '@/stores/feedStore'
import { useUIStore } from '@/stores/uiStore'
import EntryCard from './EntryCard.vue'
import EntryList from './EntryList.vue'

const feedStore = useFeedStore()
const uiStore = useUIStore()

const viewMode = computed({
  get: () => uiStore.viewMode,
  set: (value) => uiStore.setViewMode(value)
})

async function refreshFeed() {
  if (feedStore.selectedFeedUrl) {
    await feedStore.refreshFeed(feedStore.selectedFeedUrl)
  }
}
</script>
