import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

// Initialize Redis client if environment variables are provided
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

// Rate Limiters
// Orders: 3 requests per IP per hour
export const ordersRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      prefix: "anabia:ratelimit:orders",
    })
  : null;

// Inquiries: 5 requests per IP per hour
export const inquiriesRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "anabia:ratelimit:inquiries",
    })
  : null;

// Quotes: 5 requests per IP per hour
export const quotesRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "anabia:ratelimit:quotes",
    })
  : null;

/**
 * Extract client IP address from Next.js request headers
 */
export function getClientIp(request: NextRequest): string {
  if ((request as any).ip) {
    return (request as any).ip;
  }
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      return parts[0];
    }
  }
  return "127.0.0.1";
}

/**
 * Rate limit checker with graceful fallback
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (!limiter) {
    // Graceful fallback if Redis is not configured or in offline dev
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (err) {
    console.warn("Rate limiting service error (failing open):", err);
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}
