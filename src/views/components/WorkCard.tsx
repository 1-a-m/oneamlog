import type { Work } from '../../types';

interface WorkCardProps {
  work: Work;
}

export function WorkCard({ work }: WorkCardProps) {
  return (
    <article class="work-card">
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
            {work.technologies.map((tech) => (
              <span class="tech-badge" key={tech}>{tech}</span>
            ))}
          </div>
        )}

        {(work.project_url || work.github_url) && (
          <div class="work-card-links">
            {work.project_url && (
              <a href={work.project_url} class="work-link" target="_blank" rel="noopener noreferrer">
                🔗 プロジェクト
              </a>
            )}
            {work.github_url && (
              <a href={work.github_url} class="work-link" target="_blank" rel="noopener noreferrer">
                📦 GitHub
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
