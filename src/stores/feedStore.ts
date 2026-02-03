import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Feed } from '@/types/feed.types'
import type { Entry } from '@/types/entry.types'
import * as storage from '@/utils/storage'
import { fetchWithProxy } from '@/utils/corsProxy'
import { parseFeed } from '@/utils/feedParser'

export const useFeedStore = defineStore('feed', () => {
  // State
  const feeds = ref<Feed[]>([])
  const entries = ref<Entry[]>([])
  const selectedFeedUrl = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const selectedFeed = computed(() => {
    return feeds.value.find(f => f.url === selectedFeedUrl.value)
  })

  const selectedFeedEntries = computed(() => {
    if (!selectedFeedUrl.value) return []
    return entries.value
      .filter(e => e.feedUrl === selectedFeedUrl.value)
      .sort((a, b) => b.pubDate - a.pubDate)
  })


  // Actions
  async function loadFeedsFromStorage() {
    try {
      const storedFeeds = await storage.getFeeds()
      const storedEntries = await storage.getEntries()

      feeds.value = storedFeeds
      entries.value = storedEntries
    } catch (err) {
      console.error('Failed to load feeds from storage:', err)
      error.value = 'Failed to load feeds from storage'
    }
  }

  async function addFeed(feedUrl: string) {
    try {
      isLoading.value = true
      error.value = null

      // Check if feed already exists
      if (feeds.value.some(f => f.url === feedUrl)) {
        error.value = 'Feed already exists'
        return
      }

      // Fetch and parse feed
      const response = await fetchWithProxy(feedUrl)
      const xmlText = await response.text()
      const { feed, entries: feedEntries } = parseFeed(xmlText, feedUrl)

      // Add to storage
      await storage.addFeed(feed as Feed)

      // Add entries to storage
      await storage.addEntries(feedEntries as Entry[])

      // Update local state
      feeds.value.push(feed as Feed)
      entries.value.push(...(feedEntries as Entry[]))

    } catch (err) {
      console.error('Failed to add feed:', err)
      error.value = err instanceof Error ? err.message : 'Failed to add feed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function removeFeed(feedUrl: string) {
    try {
      isLoading.value = true
      error.value = null

      await storage.removeFeed(feedUrl)

      feeds.value = feeds.value.filter(f => f.url !== feedUrl)
      entries.value = entries.value.filter(e => e.feedUrl !== feedUrl)

      if (selectedFeedUrl.value === feedUrl) {
        selectedFeedUrl.value = null
      }
    } catch (err) {
      console.error('Failed to remove feed:', err)
      error.value = 'Failed to remove feed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function refreshFeed(feedUrl: string) {
    try {
      isLoading.value = true
      error.value = null

      // Fetch and parse feed
      const response = await fetchWithProxy(feedUrl)
      const xmlText = await response.text()
      const { feed, entries: feedEntries } = parseFeed(xmlText, feedUrl)

      // Update feed metadata
      const existingFeed = feeds.value.find(f => f.url === feedUrl)
      if (!existingFeed) return

      const updatedFeed: Feed = {
        ...existingFeed,
        ...feed,
        lastFetched: Date.now()
      }

      await storage.updateFeed(updatedFeed)

      // Add new entries (storage will handle duplicates)
      await storage.addEntries(feedEntries as Entry[])

      // Reload from storage to get updated entries
      await loadFeedsFromStorage()

    } catch (err) {
      console.error('Failed to refresh feed:', err)
      error.value = 'Failed to refresh feed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function refreshAllFeeds() {
    for (const feed of feeds.value) {
      try {
        await refreshFeed(feed.url)
      } catch (err) {
        console.error(`Failed to refresh feed ${feed.url}:`, err)
      }
    }
  }


  function selectFeed(feedUrl: string | null) {
    selectedFeedUrl.value = feedUrl
  }

  return {
    // State
    feeds,
    entries,
    selectedFeedUrl,
    isLoading,
    error,

    // Getters
    selectedFeed,
    selectedFeedEntries,

    // Actions
    loadFeedsFromStorage,
    addFeed,
    removeFeed,
    refreshFeed,
    refreshAllFeeds,
    selectFeed
  }
})
