import type { Contact } from "./types";

// 값이 없는 필드는 렌더링하지 않는다 (mailto:(미정) 같은 링크 금지)
export const contact: Contact = {
  email: "back86538774@gmail.com",
  links: [{ label: "GitHub", href: "https://github.com/evenif99" }],
};
