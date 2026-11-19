import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";

interface RateLimitRecord {
  timestamps: number[];
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly ipRequests = new Map<string, RateLimitRecord>();

  private readonly MAX_PER_MINUTE = 10;
  private readonly MAX_PER_HOUR = 100;
  private readonly ONE_MINUTE_MS = 60 * 1000;
  private readonly ONE_HOUR_MS = 60 * 60 * 1000;

  constructor() {
    // Run cleanup every 5 minutes to purge stale IPs
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Asserts that the given IP has not exceeded rate limits.
   * Throws 429 Too Many Requests if limit exceeded.
   */
  assertAllowed(ip: string): void {
    const now = Date.now();
    const cleanIp = ip || "unknown";

    let record = this.ipRequests.get(cleanIp);
    if (!record) {
      record = { timestamps: [] };
      this.ipRequests.set(cleanIp, record);
    }

    // Filter out timestamps older than 1 hour
    record.timestamps = record.timestamps.filter(
      (ts) => now - ts < this.ONE_HOUR_MS,
    );

    // Count requests in last minute
    const recentOneMinute = record.timestamps.filter(
      (ts) => now - ts < this.ONE_MINUTE_MS,
    ).length;

    if (recentOneMinute >= this.MAX_PER_MINUTE) {
      this.logger.warn(`Rate limit exceeded for IP: ${cleanIp} (1-minute limit)`);
      throw new HttpException(
        {
          message: "Too many verification attempts. Please try again later.",
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (record.timestamps.length >= this.MAX_PER_HOUR) {
      this.logger.warn(`Rate limit exceeded for IP: ${cleanIp} (1-hour limit)`);
      throw new HttpException(
        {
          message: "Too many verification attempts. Please try again later.",
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.timestamps.push(now);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [ip, record] of this.ipRequests.entries()) {
      record.timestamps = record.timestamps.filter(
        (ts) => now - ts < this.ONE_HOUR_MS,
      );
      if (record.timestamps.length === 0) {
        this.ipRequests.delete(ip);
      }
    }
  }
}
