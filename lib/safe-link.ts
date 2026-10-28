// https: 와 mailto: 만 허용하는 링크 헬퍼 (순수 함수)

export type SafeLink = {
  readonly href: string;
  readonly external: boolean;
};

const parseUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

export function safeLink(value: string | undefined): SafeLink | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;

  const url = parseUrl(trimmed);
  if (url === null) return null;

  if (url.protocol === "https:") {
    if (url.username !== "" || url.password !== "") return null;
    return { href: url.href, external: true };
  }
  if (url.protocol === "mailto:" && url.pathname !== "") {
    return { href: url.href, external: false };
  }
  return null;
}

// 이메일 주소 문자열에 mailto: 를 붙여 검증
export function safeEmailLink(email: string | undefined): SafeLink | null {
  if (email === undefined) return null;
  const trimmed = email.trim();
  if (trimmed === "" || /[\s:?#/\\]/.test(trimmed)) return null;
  return safeLink(`mailto:${trimmed}`);
}
