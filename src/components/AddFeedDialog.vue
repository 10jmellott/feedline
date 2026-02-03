<template>
  <v-dialog v-model="dialog" max-width="600px">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" color="primary" block class="mb-4">
        <v-icon left>mdi-plus</v-icon>
        Add Feed
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        <span class="text-h5">Add RSS Feed</span>
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="feedUrl"
          label="Feed URL"
          placeholder="https://example.com/feed.xml"
          :error-messages="errorMessage"
          @keyup.enter="addFeed"
        ></v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="close">Cancel</v-btn>
        <v-btn color="primary" :loading="isAdding" @click="addFeed">Add</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFeedStore } from '@/stores/feedStore'

const feedStore = useFeedStore()

const dialog = ref(false)
const feedUrl = ref('')
const errorMessage = ref('')
const isAdding = ref(false)

async function addFeed() {
  if (!feedUrl.value) {
    errorMessage.value = 'Please enter a feed URL'
    return
  }

  // Basic URL validation
  try {
    new URL(feedUrl.value)
  } catch {
    errorMessage.value = 'Please enter a valid URL'
    return
  }

  try {
    isAdding.value = true
    errorMessage.value = ''
    await feedStore.addFeed(feedUrl.value)
    close()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to add feed'
  } finally {
    isAdding.value = false
  }
}

function close() {
  dialog.value = false
  feedUrl.value = ''
  errorMessage.value = ''
}
</script>
