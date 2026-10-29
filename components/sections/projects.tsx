import Container from "@/components/container";
import ProjectCard from "@/components/project-card";
import ProjectCardMotion from "@/components/motion/project-card-motion";
import Reveal from "@/components/motion/reveal";
import ThemeLayer from "@/components/theme-layer";
import { projects } from "@/lib/projects";

// 스냅 모드(tablet:slide:)에서는 프로젝트 하나가 한 화면(100svh - 4rem)을 차지한다.
// --slide-offset = 섹션 상단 padding + h2 높이(text-5xl, line-height 1) + 목록 pt.
// py-28 / py-36, text-5xl, tablet:pt-14 를 바꾸면 section 의 --slide-offset 도 함께 수정한다.
// 첫 슬라이드는 offset 만큼 짧고, 나머지는 offset 만큼 padding 을 둬 카드 위치를 첫 슬라이드와 맞춘다.
const FIRST_SLIDE_CLASS =
  "tablet:slide:min-h-[calc(100svh_-_4rem_-_var(--slide-offset))]";
const NEXT_SLIDE_CLASS =
  "tablet:slide:min-h-[calc(100svh_-_4rem)] tablet:slide:pt-[var(--slide-offset)]";

// 슬라이드 시작 지점의 스냅 앵커. 섹션 전체를 스냅 영역으로 두면 한 화면보다 커지므로 빈 요소를 쓴다.
function SnapAnchor() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 hidden h-px scroll-mt-16 snap-start snap-always tablet:slide:block"
    />
  );
}

export default function Projects() {
  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="relative scroll-mt-16 bg-bg py-20 tablet:py-28 tablet:slide:[--slide-offset:13.5rem] desktop:py-36 desktop:slide:[--slide-offset:15.5rem]"
    >
      <SnapAnchor />
      <ThemeLayer />
      <Container className="relative bg-transparent" data-theme-content>
        <Reveal>
          <h2
            id="projects-title"
            className="text-3xl font-semibold tracking-tight text-ink tablet:text-5xl"
          >
            Projects
          </h2>
          <ul className="grid grid-cols-1 gap-12 pt-10 tablet:grid-cols-2 tablet:gap-10 tablet:pt-14 tablet:slide:grid-cols-1 tablet:slide:gap-0">
            {projects.map((project, index) => (
              <li
                key={project.name}
                className={`relative ${index === 0 ? FIRST_SLIDE_CLASS : NEXT_SLIDE_CLASS}`}
              >
                {index === 0 ? null : <SnapAnchor />}
                <ProjectCardMotion>
                  <ProjectCard project={project} />
                </ProjectCardMotion>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
