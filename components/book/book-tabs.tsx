const TABS: readonly { readonly href: string; readonly label: string }[] = [
  { href: "#book-intro", label: "소개" },
  { href: "#book-skills", label: "기술" },
];

// nav 는 페이지에 하나뿐이고 허용 문구에 라벨이 없어 aria-label 을 붙이지 않는다.
// aria-current="location" 은 BookScroll 이 갱신한다(표지 상태인 SSR 초기에는 없음).
export default function BookTabs() {
  return (
    <nav
      data-book-tabs
      className="order-1 tablet:slide:absolute tablet:slide:top-[12%] tablet:slide:left-full"
    >
      <ul className="flex gap-3 px-gutter py-4 tablet:slide:flex-col tablet:slide:gap-[0.8svh] tablet:slide:p-0">
        {TABS.map((tab) => (
          <li key={tab.href}>
            <a
              href={tab.href}
              className="block rounded-lg bg-book-green px-4 py-3 font-medium text-book-bg aria-[current=location]:bg-book-paper aria-[current=location]:text-book-ink tablet:slide:flex tablet:slide:h-[76px] tablet:slide:w-8 tablet:slide:items-center tablet:slide:justify-center tablet:slide:rounded-l-none tablet:slide:rounded-r-[8px] tablet:slide:p-0 tablet:slide:text-[14px] tablet:slide:whitespace-nowrap tablet:slide:aria-[current=location]:w-9 tablet:slide:[writing-mode:vertical-rl]"
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
