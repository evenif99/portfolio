import Container from "@/components/container";
import ContactForm from "@/components/contact-form";
import Reveal from "@/components/motion/reveal";
import ThemeLayer from "@/components/theme-layer";
import { contact } from "@/lib/contact";
import { safeEmailLink, safeLink, type SafeLink } from "@/lib/safe-link";
import { PLACEHOLDER } from "@/lib/types";

type ContactItem = { readonly label: string; readonly link: SafeLink };

function buildItems(): readonly ContactItem[] {
  const items: ContactItem[] = [];
  const email = safeEmailLink(contact.email);
  if (email !== null && contact.email !== undefined) {
    items.push({ label: contact.email.trim(), link: email });
  }
  for (const entry of contact.links ?? []) {
    const link = safeLink(entry.href);
    if (link !== null) items.push({ label: entry.label, link });
  }
  return items;
}

export default function ContactSection() {
  const items = buildItems();

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      data-theme="dark"
      className="relative scroll-mt-16 bg-bg py-20 tablet:py-28 desktop:py-36"
    >
      <ThemeLayer />
      <Container
        size="narrow"
        className="relative bg-transparent"
        data-theme-content
      >
        <Reveal>
          <h2
            id="contact-title"
            className="text-3xl font-semibold tracking-tight text-ink tablet:text-5xl"
          >
            Contact
          </h2>
          {items.length > 0 ? (
            <ul className="flex flex-col gap-2 pt-8 text-base text-ink-sub tablet:text-lg">
              {items.map((item) => (
                <li key={`${item.label}-${item.link.href}`}>
                  <a
                    href={item.link.href}
                    className="inline-block py-2 break-words underline decoration-accent underline-offset-4"
                    {...(item.link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="pt-8 text-base break-words text-ink-sub tablet:text-lg">
              {PLACEHOLDER}
            </p>
          )}
          <ContactForm />
        </Reveal>
      </Container>
    </section>
  );
}
