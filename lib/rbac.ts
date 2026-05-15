export type UserRole = "ADMIN" | "OPERATOR" | "VIEWER";

/** ADMIN만 허용 (품목·공급업체·단가·카테고리·브랜드·사용자 관리) */
export const canAdmin = (role?: string | null): boolean =>
  role === "ADMIN";

/** ADMIN + OPERATOR 허용 (입출고·발주·출고 요청) */
export const canOperate = (role?: string | null): boolean =>
  role === "ADMIN" || role === "OPERATOR";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN:    "관리자",
  OPERATOR: "운영자",
  VIEWER:   "조회자",
};
