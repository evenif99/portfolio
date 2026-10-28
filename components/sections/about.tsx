import Container from "@/components/container";
import Reveal from "@/components/motion/reveal";
import { profile } from "@/lib/profile";

export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="scroll-mt-16 bg-surface py-20 tablet:py-28 desktop:py-36"
    >
      <Container size="narrow">
        <Reveal>
          <h2
            id="about-title"
            className="text-3xl font-semibold tracking-tight text-ink tablet:text-5xl"
          >
            About
          </h2>
          <p className="pt-6 text-base break-words text-ink-sub tablet:pt-8 tablet:text-lg">
            {profile.about}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
