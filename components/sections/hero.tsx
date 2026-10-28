import Container from "@/components/container";

export default function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="scroll-mt-16 bg-bg py-24 tablet:py-32 desktop:py-48"
    >
      <Container>
        <h1
          id="hero-title"
          className="text-5xl font-semibold tracking-tight break-words text-ink tablet:text-7xl desktop:text-9xl"
        >
          백종우
        </h1>
        <p className="pt-4 text-xl break-words text-ink-sub tablet:pt-6 tablet:text-3xl">
          fullstack developer
        </p>
      </Container>
    </section>
  );
}
