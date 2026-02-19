import type { Work } from '../../types';

interface WorkCardProps {
  work: Work;
}

export function WorkCard({ work }: WorkCardProps) {
  const detailUrl = work.slug ? `/work/${work.slug}` : `/work/id/${work.id}`;

  return (
    <article class="work-card">
      <a href={detailUrl} class="work-card-link">
        {work.image_url && (
          <div class="work-card-image">
            <img src={work.image_url} alt={work.title} loading="lazy" />
          </div>
        )}
        <div class="work-card-content">
          <h2 class="work-card-title">{work.title}</h2>
          {work.period && (
            <p class="work-card-period">📅 {work.period}</p>
          )}
          <p class="work-card-description">{work.description}</p>
          {work.technologies && work.technologies.length > 0 && (
            <div class="work-card-technologies">
              {work.technologies.slice(0, 3).map((tech) => (
                <span class="tech-badge" key={tech}>{tech}</span>
              ))}
            </div>
          )}
        </div>
      </a>
    </article>
  );
}
