import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env";

export type InquiryRow = {
  name: string;
  email: string;
  message: string;
  ip_hash: string | null;
  user_agent: string | null;
};

/** 호출 시점에 service-role 클라이언트를 생성. 설정이 없으면 null. */
export function createServiceClient(): SupabaseClient | null {
  const env = getServerEnv();
  if (!env.configured) return null;
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** 성공 여부만 반환. 로그에는 에러 name만 남긴다. */
export async function insertInquiry(row: InquiryRow): Promise<boolean> {
  try {
    const client = createServiceClient();
    if (!client) return false;
    const { error } = await client.from("inquiries").insert(row);
    if (error) console.error("insertInquiry failed:", error.name);
    return !error;
  } catch (e) {
    console.error(
      "insertInquiry threw:",
      e instanceof Error ? e.name : "unknown",
    );
    return false;
  }
}
