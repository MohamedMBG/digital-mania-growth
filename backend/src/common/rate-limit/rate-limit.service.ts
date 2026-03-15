import { Injectable } from "@nestjs/common";

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

@Injectable()
export class RateLimitService {
  private readonly records = new Map<string, RateLimitRecord>();

  consume(key: string, windowMs: number) {
    const now = Date.now();
    const current = this.records.get(key);

    if (!current || current.resetAt <= now) {
      const nextRecord = {
        count: 1,
        resetAt: now + windowMs,
      };

      this.records.set(key, nextRecord);
      this.pruneExpired(now);

      return nextRecord;
    }

    current.count += 1;
    this.records.set(key, current);

    return current;
  }

  private pruneExpired(now: number) {
    for (const [key, record] of this.records.entries()) {
      if (record.resetAt <= now) {
        this.records.delete(key);
      }
    }
  }
}
