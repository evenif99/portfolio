"use server";

import { getHashedClientIp } from "@/lib/client-ip";
import { insertInquiry } from "@/lib/db/inquiry";
import { inquirySchema } from "@/lib/inquiry-schema";
import type {
  FormState,
  InquiryFieldErrors,
  InquiryValues,
} from "@/lib/inquiry-state";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

const HONEYPOT_FIELD = "company_website_url";
const USER_AGENT_MAX = 256;
const CONTROL_CHARS = /[\p{Cc}\p{Zl}\p{Zp}]/gu;

function readString(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function sanitizeUserAgent(raw: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(CONTROL_CHARS, "").slice(0, USER_AGENT_MAX);
  return cleaned.length > 0 ? cleaned : null;
}

export async function submitInquiry(
  prev: FormState,
  formData: FormData,
): Promise<FormState> {
  void prev;
  try {
    const honeypot = formData.get(HONEYPOT_FIELD);
    if (honeypot !== null && honeypot !== "") {
      return { status: "success" };
    }

    const values: InquiryValues = {
      name: readString(formData, "name"),
      email: readString(formData, "email"),
      message: readString(formData, "message"),
    };

    const parsed = inquirySchema.safeParse(values);
    if (!parsed.success) {
      const errors: InquiryFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (
          (key === "name" || key === "email" || key === "message") &&
          !errors[key]
        ) {
          const code = issue.message;
          if (
            code === "required" ||
            code === "too_long" ||
            code === "invalid_email" ||
            code === "newline"
          ) {
            errors[key] = code;
          }
        }
      }
      return { status: "invalid", errors, values };
    }

    // 실제 IP 해시 또는 공용 버킷 해시. rate limit과 insert에 같은 값을 쓴다.
    const ipHash = await getHashedClientIp();
    if ((await checkRateLimit(ipHash)) === "limited") {
      return { status: "rate_limited" };
    }

    const userAgent = sanitizeUserAgent((await headers()).get("user-agent"));
    const ok = await insertInquiry({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      ip_hash: ipHash,
      user_agent: userAgent,
    });
    return ok ? { status: "success" } : { status: "error" };
  } catch (e) {
    console.error(
      "submitInquiry failed:",
      e instanceof Error ? e.name : "unknown",
    );
    return { status: "error" };
  }
}
