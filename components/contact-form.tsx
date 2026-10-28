"use client";

import { useActionState, useRef, type ReactNode } from "react";
import { submitInquiry } from "@/app/actions/contact";
import { useGSAP } from "@/lib/gsap";
import type { InquiryErrorCode } from "@/lib/inquiry-schema";
import {
  initialFormState,
  type InquiryValues,
} from "@/lib/inquiry-state";
import { PLACEHOLDER } from "@/lib/types";

// app/actions/contact.ts 의 HONEYPOT_FIELD 와 같은 값 ("use server" 파일은 상수를 export 할 수 없음)
const HONEYPOT_FIELD = "company_website_url";

const FIELD_ORDER = ["name", "email", "message"] as const;

const ERROR_TEXT: Record<InquiryErrorCode, string> = {
  required: "필수 입력입니다.",
  too_long: "입력 가능한 길이를 넘었습니다.",
  invalid_email: "이메일 형식을 확인해 주세요.",
  newline: "줄바꿈이나 제어 문자는 사용할 수 없습니다.",
};

const STATUS_TEXT = {
  success: "문의가 접수되었습니다.",
  rate_limited: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
  error: "전송하지 못했습니다. 잠시 후 다시 시도해 주세요.",
} as const;

const EMPTY_VALUES: InquiryValues = { name: "", email: "", message: "" };

const FIELD_CLASS =
  "w-full rounded-none border border-ink/60 bg-transparent px-4 py-3 text-base text-ink aria-invalid:border-accent";

function ErrorIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4.5v4M8 11v.01" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M5 8.5l2 2 4-4.5" />
    </svg>
  );
}

function Notice({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-start gap-2">
      {icon}
      <span>{children}</span>
    </span>
  );
}

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitInquiry,
    initialFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // 비애니메이션 상태 전환: reduced-motion 분기 불필요. 초기 idle 에서는 이동하지 않는다.
  // preventScroll: false — 포커스 대상이 화면 밖이어도 보이도록 브라우저 기본 스크롤을 허용한다.
  useGSAP(
    () => {
      if (state.status === "invalid") {
        const first = FIELD_ORDER.find((key) => state.errors[key] !== undefined);
        if (first === undefined) return;
        formRef.current
          ?.querySelector<HTMLElement>(`#contact-${first}`)
          ?.focus({ preventScroll: false });
      } else if (state.status === "success") {
        statusRef.current?.focus({ preventScroll: false });
      }
    },
    { dependencies: [state], scope: formRef },
  );

  const values =
    state.status === "invalid" ||
    state.status === "rate_limited" ||
    state.status === "error"
      ? state.values
      : EMPTY_VALUES;
  const errors = state.status === "invalid" ? state.errors : {};

  const statusNotice =
    state.status === "success" ? (
      <Notice icon={<SuccessIcon />}>{STATUS_TEXT.success}</Notice>
    ) : state.status === "rate_limited" ? (
      <Notice icon={<ErrorIcon />}>{STATUS_TEXT.rate_limited}</Notice>
    ) : state.status === "error" ? (
      <Notice icon={<ErrorIcon />}>{STATUS_TEXT.error}</Notice>
    ) : null;

  function renderError(key: (typeof FIELD_ORDER)[number]) {
    const code = errors[key];
    return (
      <p
        id={`contact-${key}-error`}
        className="min-h-10 text-sm text-accent"
      >
        {code !== undefined ? (
          <Notice icon={<ErrorIcon />}>{ERROR_TEXT[code]}</Notice>
        ) : null}
      </p>
    );
  }

  function fieldProps(key: (typeof FIELD_ORDER)[number]) {
    const hasError = errors[key] !== undefined;
    return {
      id: `contact-${key}`,
      name: key,
      required: true,
      defaultValue: values[key],
      "aria-invalid": hasError,
      "aria-describedby": hasError ? `contact-${key}-error` : undefined,
      className: FIELD_CLASS,
    };
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      aria-busy={isPending}
      onSubmit={(e) => {
        if (isPending) e.preventDefault();
      }}
      className="flex flex-col gap-2 pt-12"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-name" className="text-sm text-ink">
          이름
        </label>
        <input
          {...fieldProps("name")}
          type="text"
          autoComplete="name"
          maxLength={50}
        />
        {renderError("name")}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-email" className="text-sm text-ink">
          이메일
        </label>
        <input
          {...fieldProps("email")}
          type="email"
          autoComplete="email"
          maxLength={254}
        />
        {renderError("email")}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className="text-sm text-ink">
          메시지
        </label>
        <textarea {...fieldProps("message")} rows={6} maxLength={2000} />
        {renderError("message")}
      </div>

      <div aria-hidden="true" className="sr-only">
        <label htmlFor="contact-hp">website</label>
        <input
          id="contact-hp"
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <p className="text-sm break-words text-ink-sub">{PLACEHOLDER}</p>

      <div className="pt-4">
        <button
          type="submit"
          aria-disabled={isPending}
          onClick={(e) => {
            if (isPending) e.preventDefault();
          }}
          className="border border-ink px-6 py-3 text-base text-ink aria-disabled:opacity-60"
        >
          {isPending ? "보내는 중" : "보내기"}
        </button>
      </div>

      <div
        ref={statusRef}
        role="status"
        tabIndex={-1}
        className="min-h-16 pt-4 text-base text-accent"
      >
        {statusNotice}
      </div>
    </form>
  );
}
