import Container from "@/components/container";
import { profile } from "@/lib/profile";

export default function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="scroll-mt-16 bg-bg py-24 tablet:slide:min-h-[calc(100svh_-_4rem)] tablet:snap-start tablet:snap-always tablet:py-32 desktop:py-48"
    >
      <Container>
        <h1
          id="hero-title"
          className="text-5xl font-semibold tracking-tight break-words text-ink tablet:text-7xl desktop:text-9xl"
        >
          {profile.name}
        </h1>
        <p className="pt-4 text-xl break-words text-ink-sub tablet:pt-6 tablet:text-3xl">
          {profile.role}
        </p>
        <p className="pt-4 text-base break-words text-ink-sub tablet:pt-6 tablet:text-lg">
          {profile.tagline}
        </p>
      </Container>
    </section>
  );
}
