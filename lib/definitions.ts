import { z } from "zod";

export const SignupSchema = z.object({
  name: z.string().min(2, { message: "이름은 2자 이상이어야 합니다." }).trim(),
  email: z.string().email({ message: "유효한 이메일을 입력하세요." }).trim(),
  password: z
    .string()
    .min(8, { message: "비밀번호는 8자 이상이어야 합니다." })
    .regex(/[a-zA-Z]/, { message: "영문자를 포함해야 합니다." })
    .regex(/[0-9]/, { message: "숫자를 포함해야 합니다." })
    .trim(),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: "유효한 이메일을 입력하세요." }).trim(),
  password: z.string().min(1, { message: "비밀번호를 입력하세요." }),
});

export type SignupFormState =
  | { errors?: { name?: string[]; email?: string[]; password?: string[] }; message?: string }
  | undefined;

export type LoginFormState =
  | { errors?: { email?: string[]; password?: string[] }; message?: string }
  | undefined;
