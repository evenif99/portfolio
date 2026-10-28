import type { InquiryErrorCode } from "@/lib/inquiry-schema";

export type InquiryValues = {
  name: string;
  email: string;
  message: string;
};

export type InquiryFieldErrors = Partial<
  Record<keyof InquiryValues, InquiryErrorCode>
>;

export type FormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "rate_limited" }
  | { status: "error" }
  | {
      status: "invalid";
      errors: InquiryFieldErrors;
      values: InquiryValues;
    };

export const initialFormState: FormState = { status: "idle" };
