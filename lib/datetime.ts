// KST = UTC+9
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 한국 시간(KST) 기준 오늘 00:00:00 을 UTC Date로 반환 */
export function kstStartOfToday(): Date {
  const now = new Date();
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  return new Date(
    Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()) - KST_OFFSET_MS,
  );
}

/** KST 기준 날짜 문자열 반환 (YYYY-MM-DD) */
export function kstDateString(date: Date = new Date()): string {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  return kst.toISOString().slice(0, 10);
}

/** KST 기준 날짜+시각 문자열 반환 (YYYY-MM-DD HH:MM) */
export function kstDateTimeString(date: Date): string {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  return `${kst.toISOString().slice(0, 10)} ${kst.toISOString().slice(11, 16)}`;
}

/** 경과 시간 문자열 반환 (방금 전 / N분 전 / N시간 전 / N일 전) */
export function timeAgo(date: Date): string {
  const diff    = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1)  return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}
