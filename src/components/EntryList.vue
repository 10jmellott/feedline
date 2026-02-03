<template>
  <v-list>
    <template v-for="(entry, index) in entries" :key="entry.id || entry.guid">
      <v-list-item
        @click="handleClick(entry)"
        class="entry-list-item"
      >
        <v-list-item-title class="text-wrap">
          <span v-html="entry.title"></span>
        </v-list-item-title>

        <v-list-item-subtitle class="text-wrap mt-1">
          {{ formattedDate(entry.pubDate) }}
          <span v-if="entry.author"> • <span>{{ entry.author['#text'] ?? entry.author }}</span></span>
        </v-list-item-subtitle>

        <template v-slot:append>
          <v-icon>mdi-open-in-new</v-icon>
        </template>
      </v-list-item>
    </template>
  </v-list>
</template>

<script setup lang="ts">
import type { Entry } from '@/types/entry.types'

defineProps<{
  entries: Entry[]
}>()

function formattedDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function handleClick(entry: Entry) {
  // Open link in new tab
  if (entry.link) {
    window.open(entry.link, '_blank')
  }
}
</script>

<style scoped>
.entry-list-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding-top: 1rem;
  padding-bottom: 1rem;
}
</style>
