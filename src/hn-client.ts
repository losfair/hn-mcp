import { HackerNewsItem, HackerNewsUser, HackerNewsUpdates, StoryType } from './types.js';

export class HackerNewsClient {
  private readonly baseUrl = 'https://hacker-news.firebaseio.com/v0';

  private async fetchJson<T>(url: string): Promise<T | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return null;
    }
  }

  async getItem(id: number): Promise<HackerNewsItem | null> {
    return this.fetchJson<HackerNewsItem>(`${this.baseUrl}/item/${id}.json`);
  }

  async getUser(username: string): Promise<HackerNewsUser | null> {
    return this.fetchJson<HackerNewsUser>(`${this.baseUrl}/user/${username}.json`);
  }

  async getMaxItem(): Promise<number | null> {
    return this.fetchJson<number>(`${this.baseUrl}/maxitem.json`);
  }

  async getUpdates(): Promise<HackerNewsUpdates | null> {
    return this.fetchJson<HackerNewsUpdates>(`${this.baseUrl}/updates.json`);
  }

  private async getStoryIds(type: StoryType): Promise<number[]> {
    const endpoint = `${this.baseUrl}/${type}stories.json`;
    const ids = await this.fetchJson<number[]>(endpoint);
    return ids || [];
  }

  async getStories(type: StoryType, limit: number = 30): Promise<HackerNewsItem[]> {
    const ids = await this.getStoryIds(type);
    const limitedIds = ids.slice(0, limit);
    
    const items = await Promise.all(
      limitedIds.map(id => this.getItem(id))
    );
    
    return items.filter((item): item is HackerNewsItem => item !== null);
  }

  async getItemWithComments(id: number, maxDepth: number = 2): Promise<HackerNewsItem | null> {
    const item = await this.getItem(id);
    if (!item || !item.kids) {
      return item;
    }

    if (maxDepth > 0 && item.kids.length > 0) {
      const comments = await Promise.all(
        item.kids.slice(0, 10).map(async (kidId) => {
          return this.getItemWithComments(kidId, maxDepth - 1);
        })
      );
      
      (item as any).comments = comments.filter(comment => comment !== null);
    }

    return item;
  }
}