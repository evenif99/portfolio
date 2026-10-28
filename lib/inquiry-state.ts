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
  | { status: "rate_limited"; values: InquiryValues }
  | { status: "error"; values: InquiryValues }
  | {
      status: "invalid";
      errors: InquiryFieldErrors;
      values: InquiryValues;
    };

export const initialFormState: FormState = { status: "idle" };
