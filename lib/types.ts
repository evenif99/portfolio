// 확정되지 않은 값의 공용 표시 문구
export const PLACEHOLDER = "(미정)";

export type Project = {
  readonly name: string;
  readonly summary: string;
  readonly role: string;
  readonly period: string;
  readonly stack: readonly string[];
  readonly links?: {
    readonly deploy?: string;
    readonly github?: string;
  };
  readonly image?: {
    readonly src: string;
    readonly alt: string;
  };
};

export type Skill = {
  readonly category: string;
  readonly items: readonly string[];
};

export type Contact = {
  readonly email?: string;
  readonly links?: readonly {
    readonly label: string;
    readonly href: string;
  }[];
};
