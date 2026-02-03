export interface Entry {
  id?: number              // IndexedDB auto-increment key
  feedUrl: string          // Reference to parent feed
  guid: string             // Unique identifier from feed
  title: string            // Entry title
  description: string      // HTML content or summary
  link: string             // Entry URL
  pubDate: number          // Publication timestamp
  author?: string          // Author name
  categories?: string[]    // Tags/categories
  enclosure?: {            // Media attachment (podcast, image)
    url: string
    type: string
    length: number
  }
}
