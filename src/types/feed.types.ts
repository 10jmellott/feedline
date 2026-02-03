export interface Feed {
  url: string              // RSS feed URL (primary key)
  title: string            // Feed title
  description?: string     // Feed description
  siteUrl?: string         // Website link
  favicon?: string         // Site favicon URL
  lastFetched?: number     // Timestamp of last fetch
  unreadCount: number      // Computed: count of unread entries
}
