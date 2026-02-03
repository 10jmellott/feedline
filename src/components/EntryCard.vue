<template>
  <v-card
    class="entry-card"
    @click="handleClick"
  >
    <v-img
      v-if="imageUrl"
      :src="imageUrl"
      :alt="entry.title"
      height="200"
      cover
    ></v-img>

    <v-card-title class="text-h6">
      <span v-html="entry.title"></span>
    </v-card-title>

    <v-card-subtitle>
      {{ formattedDate }}
      <v-chip v-if="entry.author" size="small" class="ml-2"><span v-html="entry.author"></span></v-chip>
    </v-card-subtitle>

    <v-card-text>
      <div class="entry-description" v-html="truncatedDescription"></div>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-icon size="small">mdi-open-in-new</v-icon>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Entry } from '@/types/entry.types'

const props = defineProps<{
  entry: Entry
}>()

const imageUrl = computed(() => {
  // Check if entry has an enclosure with an image
  if (props.entry.enclosure && props.entry.enclosure.type.startsWith('image/')) {
    return props.entry.enclosure.url
  }

  // Try to extract first image from description HTML
  const div = document.createElement('div')
  div.innerHTML = props.entry.description
  const img = div.querySelector('img')

  if (img?.src) {
    // Handle relative URLs by converting to absolute using the entry's link domain
    try {
      const url = new URL(img.src)
      return url.href
    } catch {
      // If src is relative, try to construct absolute URL from entry link
      try {
        const entryUrl = new URL(props.entry.link)
        const absoluteUrl = new URL(img.src, entryUrl.origin)
        return absoluteUrl.href
      } catch {
        return img.src
      }
    }
  }

  return null
})

const formattedDate = computed(() => {
  const date = new Date(props.entry.pubDate)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
})

const truncatedDescription = computed(() => {
  const div = document.createElement('div')
  div.innerHTML = props.entry.description
  const text = div.textContent || div.innerText || ''
  const truncated = text.substring(0, 200)
  return truncated.length < text.length ? truncated + '...' : truncated
})

function handleClick() {
  // Open link in new tab
  if (props.entry.link) {
    window.open(props.entry.link, '_blank')
  }
}
</script>

<style scoped>
.entry-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
}

.entry-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.entry-description {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
