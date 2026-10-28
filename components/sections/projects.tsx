import Container from "@/components/container";
import ProjectCard from "@/components/project-card";
import Reveal from "@/components/motion/reveal";
import { projects } from "@/lib/projects";

export default function Projects() {
  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="scroll-mt-16 bg-bg py-20 tablet:py-28 desktop:py-36"
    >
      <Container>
        <Reveal>
          <h2
            id="projects-title"
            className="text-3xl font-semibold tracking-tight text-ink tablet:text-5xl"
          >
            Projects
          </h2>
          <ul className="grid grid-cols-1 gap-12 pt-10 tablet:grid-cols-2 tablet:gap-10 tablet:pt-14">
            {projects.map((project) => (
              <li key={project.name}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
