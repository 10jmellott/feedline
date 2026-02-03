<template>
  <v-list-item
    :active="isSelected"
    @click="$emit('select')"
    class="feed-item"
  >
    <template v-slot:prepend>
      <v-avatar size="24">
        <v-img v-if="feed.favicon" :src="feed.favicon" :alt="feed.title">
          <template v-slot:error>
            <v-icon>mdi-rss</v-icon>
          </template>
        </v-img>
        <v-icon v-else>mdi-rss</v-icon>
      </v-avatar>
    </template>

    <v-list-item-title><span v-html="feed.title"></span></v-list-item-title>

    <template v-slot:append>
      <v-btn
        icon="mdi-delete"
        size="small"
        variant="text"
        @click.stop="$emit('delete')"
      ></v-btn>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import type { Feed } from '@/types/feed.types'

defineProps<{
  feed: Feed
  isSelected: boolean
}>()

defineEmits<{
  select: []
  delete: []
}>()
</script>

<style scoped>
.feed-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}
</style>
