import { XMLParser } from 'fast-xml-parser'
import type { Entry } from '@/types/entry.types'
import type { Feed } from '@/types/feed.types'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
})

export interface ParsedFeedData {
  feed: Omit<Feed, 'unreadCount'>
  entries: Omit<Entry, 'id'>[]
}

function parseRSS2(data: any, feedUrl: string): ParsedFeedData {
  const channel = data.rss.channel

  const feed = {
    url: feedUrl,
    title: channel.title || 'Untitled Feed',
    description: channel.description || '',
    siteUrl: channel.link || '',
    favicon: channel.image?.url || undefined,
    lastFetched: Date.now()
  }

  const items = Array.isArray(channel.item) ? channel.item : channel.item ? [channel.item] : []

  const entries = items.map((item: any) => {
    // Try to get enclosure from standard RSS enclosure tag
    let enclosure = item.enclosure ? {
      url: item.enclosure['@_url'],
      type: item.enclosure['@_type'],
      length: parseInt(item.enclosure['@_length']) || 0
    } : undefined

    // If no enclosure, try Media RSS (media:content or media:thumbnail)
    if (!enclosure) {
      const mediaContent = item['media:content']
      const mediaThumbnail = item['media:thumbnail']

      if (mediaContent) {
        const content = Array.isArray(mediaContent) ? mediaContent[0] : mediaContent
        enclosure = {
          url: content['@_url'],
          type: content['@_type'] || 'image/jpeg',
          length: parseInt(content['@_fileSize']) || 0
        }
      } else if (mediaThumbnail) {
        const thumbnail = Array.isArray(mediaThumbnail) ? mediaThumbnail[0] : mediaThumbnail
        enclosure = {
          url: thumbnail['@_url'],
          type: 'image/jpeg',
          length: 0
        }
      }
    }

    // Extract author - handle both string and object formats
    let author: string | undefined
    if (item.author) {
      author = typeof item.author === 'string' ? item.author : item.author['#text'] || item.author.name || undefined
    } else if (item['dc:creator']) {
      author = typeof item['dc:creator'] === 'string' ? item['dc:creator'] : item['dc:creator']['#text'] || undefined
    }

    // Extract title - handle both string and object formats
    const title = typeof item.title === 'string' ? item.title : item.title?.['#text'] || 'Untitled'

    // Extract description - handle both string and object formats
    const description = typeof item.description === 'string'
      ? item.description
      : item.description?.['#text'] || item['content:encoded'] || ''

    return {
      feedUrl,
      guid: item.guid?.['#text'] || item.guid || item.link || `${feedUrl}-${Date.now()}-${Math.random()}`,
      title,
      description,
      link: item.link || '',
      pubDate: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
      author,
      categories: item.category ? (Array.isArray(item.category) ? item.category : [item.category]) : undefined,
      enclosure
    }
  })

  return { feed, entries }
}

function parseAtom(data: any, feedUrl: string): ParsedFeedData {
  const atomFeed = data.feed

  const feed = {
    url: feedUrl,
    title: atomFeed.title?.['#text'] || atomFeed.title || 'Untitled Feed',
    description: atomFeed.subtitle?.['#text'] || atomFeed.subtitle || '',
    siteUrl: Array.isArray(atomFeed.link)
      ? atomFeed.link.find((l: any) => l['@_rel'] === 'alternate')?.['@_href'] || atomFeed.link[0]?.['@_href']
      : atomFeed.link?.['@_href'] || '',
    favicon: atomFeed.icon || undefined,
    lastFetched: Date.now()
  }

  const entries = (Array.isArray(atomFeed.entry) ? atomFeed.entry : atomFeed.entry ? [atomFeed.entry] : [])
    .map((entry: any) => {
      const links = Array.isArray(entry.link) ? entry.link : entry.link ? [entry.link] : []

      const link = links.find((l: any) => l['@_rel'] === 'alternate')?.['@_href'] || links[0]?.['@_href'] || ''

      const enclosureLink = links.find((l: any) => l['@_rel'] === 'enclosure')
      const enclosure = enclosureLink ? {
        url: enclosureLink['@_href'],
        type: enclosureLink['@_type'] || '',
        length: parseInt(enclosureLink['@_length']) || 0
      } : undefined

      return {
        feedUrl,
        guid: entry.id || link || `${feedUrl}-${Date.now()}-${Math.random()}`,
        title: entry.title?.['#text'] || entry.title || 'Untitled',
        description: entry.content?.['#text'] || entry.summary?.['#text'] || entry.summary || '',
        link,
        pubDate: entry.published ? new Date(entry.published).getTime() : entry.updated ? new Date(entry.updated).getTime() : Date.now(),
        author: entry.author?.name || undefined,
        categories: entry.category ? (Array.isArray(entry.category) ? entry.category.map((c: any) => c['@_term']) : [entry.category['@_term']]) : undefined,
        enclosure
      }
    })

  return { feed, entries }
}

export function parseFeed(xmlString: string, feedUrl: string): ParsedFeedData {
  try {
    const data = parser.parse(xmlString)

    // Detect feed type
    if (data.rss) {
      return parseRSS2(data, feedUrl)
    } else if (data.feed) {
      return parseAtom(data, feedUrl)
    } else {
      throw new Error('Unknown feed format')
    }
  } catch (error) {
    console.error('Error parsing feed:', error)
    throw new Error(`Failed to parse feed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
