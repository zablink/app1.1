// src/utils/rate-limit.ts

import LRU from 'lru-cache';
import type { NextApiRequest, NextApiResponse } from 'next';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
  max?: number;
};

export default function rateLimit(options?: Options) {
  const tokenCache = new LRU({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000, // 1 นาที
  });

  return {
    check: (res: NextApiResponse, limit: number, token: string) => {
      const tokenCount = (tokenCache.get(token) as number) || 0;
      if (tokenCount >= limit) {
        res.status(429).json({ error: 'Too many requests' });
        throw new Error('Rate limit exceeded');
      }
      tokenCache.set(token, tokenCount + 1);
    },
  };
}
