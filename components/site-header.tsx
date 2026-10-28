import Container from "@/components/container";

const NAV_ITEMS: readonly { readonly href: string; readonly label: string }[] = [
  { href: "#hero", label: "Hero" },
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-ink/20 bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-20 focus:bg-bg focus:p-4 focus:text-ink-sub"
      >
        본문으로 건너뛰기
      </a>
      <Container className="flex h-16 items-center justify-end">
        <nav aria-label="주요 메뉴">
          <ul className="flex flex-wrap items-center justify-end gap-1 tablet:gap-4">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block px-2 py-3 text-sm text-ink-sub tablet:px-3 tablet:text-base"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
