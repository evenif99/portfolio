import Container from "@/components/container";
import Reveal from "@/components/motion/reveal";
import ThemeLayer from "@/components/theme-layer";
import { skills } from "@/lib/skills";

export default function Skills() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-title"
      data-theme="dark"
      className="relative scroll-mt-16 bg-bg py-20 tablet:py-28 desktop:py-36"
    >
      <ThemeLayer />
      <Container className="relative bg-transparent" data-theme-content>
        <Reveal>
          <h2
            id="skills-title"
            className="text-3xl font-semibold tracking-tight text-ink tablet:text-5xl"
          >
            Skills
          </h2>
          <div className="grid grid-cols-1 gap-10 pt-10 tablet:grid-cols-2 tablet:pt-14">
            {skills.map((skill, index) => (
              <div key={`${skill.category}-${index}`}>
                <h3 className="text-xl font-semibold text-ink">
                  {skill.category}
                </h3>
                <ul className="flex flex-wrap gap-x-4 gap-y-2 pt-4 text-base text-ink-sub">
                  {skill.items.map((item, itemIndex) => (
                    <li key={`${item}-${itemIndex}`} className="break-words">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
