import type { Feed } from '@/types/feed.types'
import type { Entry } from '@/types/entry.types'

const DB_NAME = 'feedline-db'
const DB_VERSION = 1

let db: IDBDatabase | null = null

export async function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result
      resolve()
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create feeds object store
      if (!db.objectStoreNames.contains('feeds')) {
        const feedStore = db.createObjectStore('feeds', { keyPath: 'url' })
        feedStore.createIndex('title', 'title', { unique: false })
      }

      // Create entries object store
      if (!db.objectStoreNames.contains('entries')) {
        const entryStore = db.createObjectStore('entries', {
          keyPath: 'id',
          autoIncrement: true
        })
        entryStore.createIndex('feedUrl', 'feedUrl', { unique: false })
        entryStore.createIndex('guid', 'guid', { unique: false })
        entryStore.createIndex('pubDate', 'pubDate', { unique: false })
      }

      // Create settings object store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
    }
  })
}

// Feed operations
export async function addFeed(feed: Feed): Promise<void> {
  if (!db) throw new Error('Database not initialized')

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['feeds'], 'readwrite')
    const store = transaction.objectStore('feeds')
    const request = store.add(feed)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function updateFeed(feed: Feed): Promise<void> {
  if (!db) throw new Error('Database not initialized')

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['feeds'], 'readwrite')
    const store = transaction.objectStore('feeds')
    const request = store.put(feed)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function removeFeed(feedUrl: string): Promise<void> {
  if (!db) throw new Error('Database not initialized')

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['feeds', 'entries'], 'readwrite')

    // Delete feed
    const feedStore = transaction.objectStore('feeds')
    feedStore.delete(feedUrl)

    // Delete all entries for this feed
    const entryStore = transaction.objectStore('entries')
    const index = entryStore.index('feedUrl')
    const request = index.openCursor(IDBKeyRange.only(feedUrl))

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function getFeeds(): Promise<Feed[]> {
  if (!db) throw new Error('Database not initialized')

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['feeds'], 'readonly')
    const store = transaction.objectStore('feeds')
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getFeed(feedUrl: string): Promise<Feed | undefined> {
  if (!db) throw new Error('Database not initialized')

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['feeds'], 'readonly')
    const store = transaction.objectStore('feeds')
    const request = store.get(feedUrl)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Entry operations
export async function addEntries(entries: Entry[]): Promise<void> {
  if (!db) throw new Error('Database not initialized')
  if (entries.length === 0) return

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['entries'], 'readwrite')
    const store = transaction.objectStore('entries')

    for (const entry of entries) {
      // Check if entry already exists by guid and feedUrl
      const index = store.index('guid')
      const request = index.get(entry.guid)

      request.onsuccess = () => {
        const existing = request.result
        if (!existing) {
          store.add(entry)
        }
      }
    }

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function getEntries(feedUrl?: string): Promise<Entry[]> {
  if (!db) throw new Error('Database not initialized')

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['entries'], 'readonly')
    const store = transaction.objectStore('entries')

    let request: IDBRequest
    if (feedUrl) {
      const index = store.index('feedUrl')
      request = index.getAll(feedUrl)
    } else {
      request = store.getAll()
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function updateEntry(entry: Entry): Promise<void> {
  if (!db) throw new Error('Database not initialized')

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['entries'], 'readwrite')
    const store = transaction.objectStore('entries')
    const request = store.put(entry)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}


// Settings operations
export async function getSetting(key: string): Promise<any> {
  if (!db) throw new Error('Database not initialized')

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['settings'], 'readonly')
    const store = transaction.objectStore('settings')
    const request = store.get(key)

    request.onsuccess = () => resolve(request.result?.value)
    request.onerror = () => reject(request.error)
  })
}

export async function setSetting(key: string, value: any): Promise<void> {
  if (!db) throw new Error('Database not initialized')

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['settings'], 'readwrite')
    const store = transaction.objectStore('settings')
    const request = store.put({ key, value })

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
