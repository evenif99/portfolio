// 슬라이드(스냅/책 펼침) 모드 조건: tablet 이상 + app/globals.css 의 @custom-variant slide 와 같은 조건.
// CSS 는 이 상수를 import 할 수 없으므로 조건을 바꾸면 globals.css 의 @custom-variant slide 도 함께 수정한다.
export const SLIDE_QUERY =
  "(min-width: 48rem) and (prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine) and (min-height: 45rem)";
