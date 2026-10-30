import { profile } from "@/lib/profile";
import { skills } from "@/lib/skills";

type PageProps = {
  readonly spread: 1 | 2;
  readonly side: "left" | "right";
  readonly children: React.ReactNode;
};

// 펼침의 한 쪽. 쪽은 넘기는 장(leaf)의 앞/뒷면에 나뉘어 들어가므로 data-spread 는 각 쪽에 붙인다.
function BookPage({ spread, side, children }: PageProps) {
  const fold = side === "left" ? "book-page-left" : "book-page-right";
  return (
    <div
      data-spread={spread}
      data-side={side}
      className={`${fold} flex flex-col gap-4 border-b border-book-ink/15 px-gutter py-10 text-book-ink tablet:slide:h-full tablet:slide:justify-center tablet:slide:gap-[2svh] tablet:slide:border-b-0 tablet:slide:px-[8%] tablet:slide:py-[6svh]`}
    >
      {children}
    </div>
  );
}

const HEADING = "font-bold tablet:slide:text-[min(2.8svh,2vw)]";
const BODY = "leading-[1.9] tablet:slide:text-[min(1.9svh,1.3vw)]";

// 기술 카테고리는 순서를 유지한 채 앞 2개/나머지로 나눈다.
const SKILLS_SPLIT = 2;

export function IntroLeftPage() {
  return (
    <BookPage spread={1} side="left">
      <h2 className="text-4xl font-bold tablet:slide:text-[min(7svh,5vw)]">
        {profile.name}
      </h2>
      <div className="h-1 w-16 rounded-full bg-book-green" />
      <p className={`${BODY} font-medium`}>{profile.tagline}</p>
    </BookPage>
  );
}

export function IntroRightPage() {
  return (
    <BookPage spread={1} side="right">
      <h2 className={HEADING}>소개</h2>
      <p className={BODY}>{profile.about}</p>
    </BookPage>
  );
}

function SkillGroups({
  start,
  end,
}: {
  readonly start: number;
  readonly end?: number;
}) {
  return (
    <>
      {skills.slice(start, end).map((skill) => (
        <section key={skill.category} className="flex flex-col gap-2">
          <h3 className="font-bold text-book-ink/70 tablet:slide:text-[min(2.2svh,1.5vw)]">
            {skill.category}
          </h3>
          <ul className={`${BODY} flex flex-col`}>
            {skill.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

export function SkillsLeftPage() {
  return (
    <BookPage spread={2} side="left">
      <h2 className={HEADING}>기술</h2>
      <SkillGroups start={0} end={SKILLS_SPLIT} />
    </BookPage>
  );
}

export function SkillsRightPage() {
  return (
    <BookPage spread={2} side="right">
      <SkillGroups start={SKILLS_SPLIT} />
    </BookPage>
  );
}
