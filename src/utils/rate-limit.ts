// src/utils/rate-limit.ts

import { LRUCache } from 'lru-cache';
import type { NextApiResponse } from 'next';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache<string, number>({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000, // 1 นาที
  });

  return {
    check: (res: NextApiResponse, limit: number, token: string) => {
      const tokenCount = tokenCache.get(token) || 0;
      if (tokenCount >= limit) {
        res.status(429).json({ error: 'Too many requests' });
        throw new Error('Rate limit exceeded');
      }
      tokenCache.set(token, tokenCount + 1);
    },
  };
}
