import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { headers } from "next/headers";
import { getServerEnv } from "@/lib/env";

// Vercel 배포 전제. x-vercel-forwarded-for, x-real-ip는 플랫폼이 덮어쓰는 값일 때만 신뢰할 수 있다.
const SHARED_BUCKET_KEY = "inquiry-shared-bucket:unknown-ip";

/** isIP 검증을 통과한 값을 해시 입력용으로 정규화: 소문자, zone id 제거, IPv4-mapped는 IPv4로. */
function normalizeIp(ip: string): string {
  const lower = ip.toLowerCase();
  const zoneAt = lower.indexOf("%");
  const base = zoneAt === -1 ? lower : lower.slice(0, zoneAt);
  if (!base.startsWith("::ffff:")) return base;
  const rest = base.slice("::ffff:".length);
  if (isIP(rest) === 4) return rest;
  const hex = /^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(rest);
  if (hex) {
    const hi = parseInt(hex[1], 16);
    const lo = parseInt(hex[2], 16);
    return `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`;
  }
  return base;
}

/** 서버 액션 내부에서만 호출할 것 (headers()는 요청 시점 API). */
export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  // 플랫폼이 설정하는 헤더만 신뢰한다. x-forwarded-for는 클라이언트가 위조 가능하므로 사용하지 않는다.
  for (const name of ["x-vercel-forwarded-for", "x-real-ip"]) {
    const value = h.get(name)?.trim();
    if (value && isIP(value) !== 0) return normalizeIp(value);
  }
  return null;
}

/**
 * rate limit과 insert가 공유하는 ip_hash. IP를 INQUIRY_HASH_SALT로 HMAC-SHA256 해시한 hex.
 * IP 확인 불가 시 고정 문자열의 해시(공용 버킷)를 반환. env 미설정이면 null.
 */
export async function getHashedClientIp(): Promise<string | null> {
  const env = getServerEnv();
  if (!env.configured) return null;
  const ip = await getClientIp();
  return createHmac("sha256", env.INQUIRY_HASH_SALT)
    .update(ip ?? SHARED_BUCKET_KEY)
    .digest("hex");
}
