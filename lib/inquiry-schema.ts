import { z } from "zod";

export type InquiryErrorCode =
  | "required"
  | "too_long"
  | "invalid_email"
  | "newline";

const NEWLINE = /[\r\n]/;
const NAME_CONTROL = /[\p{Cc}\p{Zl}\p{Zp}]/u;

export const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "required")
    .max(50, "too_long")
    .refine((v) => !NAME_CONTROL.test(v), "newline"),
  email: z
    .string()
    .trim()
    .min(1, "required")
    .max(254, "too_long")
    .refine((v) => !NEWLINE.test(v), "newline")
    .pipe(z.email("invalid_email")),
  message: z.string().trim().min(1, "required").max(2000, "too_long"),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
