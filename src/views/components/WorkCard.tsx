import type { Work } from '../../types';

interface WorkCardProps {
  work: Work;
}

export function WorkCard({ work }: WorkCardProps) {
  // Use slug if available, otherwise fall back to ID
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
              {work.technologies.map((tech) => (
                <span class="tech-badge" key={tech}>{tech}</span>
              ))}
            </div>
          )}

          <div class="work-card-read-more">
            詳細を見る →
          </div>
        </div>
      </a>

      {(work.project_url || work.github_url) && (
        <div class="work-card-links">
          {work.project_url && (
            <a href={work.project_url} class="work-link" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();">
              🔗 プロジェクト
            </a>
          )}
          {work.github_url && (
            <a href={work.github_url} class="work-link" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();">
              📦 GitHub
            </a>
          )}
        </div>
      )}
    </article>
  );
}
