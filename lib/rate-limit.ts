import "server-only";
import { createServiceClient } from "@/lib/db/inquiry";

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export type RateLimitResult = "ok" | "limited";

/**
 * ip_hash 당 최근 창 안에 이미 MAX건 이상이면 제한.
 * - 조회 실패/설정 없음: fail-closed ("limited").
 * - ip_hash 없음(env 미설정으로 해시 불가): fail-closed ("limited").
 *   (IP 확인 불가 시에는 호출 측이 공용 버킷 해시를 전달한다.)
 */
export async function checkRateLimit(
  ipHash: string | null,
): Promise<RateLimitResult> {
  if (!ipHash) return "limited";
  try {
    const client = createServiceClient();
    if (!client) return "limited";
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error } = await client
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);
    if (error || count === null) {
      console.error("rateLimit query failed:", error?.name ?? "nullCount");
      return "limited";
    }
    return count >= RATE_LIMIT_MAX ? "limited" : "ok";
  } catch (e) {
    console.error("rateLimit failed:", e instanceof Error ? e.name : "unknown");
    return "limited";
  }
}
