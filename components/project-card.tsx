import Image from "next/image";
import { safeLink } from "@/lib/safe-link";
import type { Project } from "@/lib/types";

type ProjectCardProps = { readonly project: Project };

export default function ProjectCard({ project }: ProjectCardProps) {
  const deploy = safeLink(project.links?.deploy);
  const github = safeLink(project.links?.github);
  const links = [
    deploy !== null ? { label: "Deploy", link: deploy } : null,
    github !== null ? { label: "GitHub", link: github } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <article className="flex flex-col gap-6">
      {project.image !== undefined ? (
        <div className="relative aspect-video overflow-hidden bg-surface">
          <Image
            src={project.image.src}
            alt={project.image.alt}
            fill
            data-card-image=""
            sizes="(min-width: 48rem) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          data-theme="light"
          className="aspect-video overflow-hidden bg-surface"
        />
      )}
      <div className="flex flex-col gap-3">
        <h3 className="text-2xl font-semibold break-words text-ink">
          {project.name}
        </h3>
        <p className="text-base break-words text-ink-sub">{project.summary}</p>
        <p className="text-base break-words text-ink-sub">{project.role}</p>
        <p className="text-base break-words text-ink-sub">{project.period}</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-sub">
          {project.stack.map((item, index) => (
            <li key={`${item}-${index}`} className="break-words">
              {item}
            </li>
          ))}
        </ul>
        {links.length > 0 ? (
          <ul className="flex flex-wrap gap-x-4 text-base text-ink-sub">
            {links.map(({ label, link }) => (
              <li key={label}>
                <a
                  href={link.href}
                  aria-label={`${label} ${project.name}`}
                  className="inline-block py-2 underline decoration-accent underline-offset-4"
                  {...(link.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {label}
                  {link.external ? (
                    <span className="sr-only"> (새 탭에서 열림)</span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
