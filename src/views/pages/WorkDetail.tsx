import { BaseLayout } from '../layouts/BaseLayout';
import type { Work } from '../../types';

interface WorkDetailProps {
  work: Work;
}

export function WorkDetail({ work }: WorkDetailProps) {
  return (
    <BaseLayout
      title={`${work.title} - Work - oneamlog`}
      description={work.description}
    >
      <div class="container">
        <article class="work-detail">
          <header class="work-detail-header">
            <h1 class="work-detail-title">{work.title}</h1>
            {work.period && (
              <p class="work-detail-period">📅 {work.period}</p>
            )}
          </header>

          {work.image_url && (
            <div class="work-detail-image">
              <img src={work.image_url} alt={work.title} />
            </div>
          )}

          <div class="work-detail-content">
            <section class="work-detail-section">
              <h2>概要</h2>
              <p class="work-detail-description">{work.description}</p>
            </section>

            {work.technologies && work.technologies.length > 0 && (
              <section class="work-detail-section">
                <h2>使用技術</h2>
                <div class="work-detail-technologies">
                  {work.technologies.map((tech) => (
                    <span class="tech-badge-large" key={tech}>{tech}</span>
                  ))}
                </div>
              </section>
            )}

            {(work.project_url || work.github_url) && (
              <section class="work-detail-section">
                <h2>リンク</h2>
                <div class="work-detail-links">
                  {work.project_url && (
                    <a
                      href={work.project_url}
                      class="work-detail-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🔗 プロジェクトを見る
                    </a>
                  )}
                  {work.github_url && (
                    <a
                      href={work.github_url}
                      class="work-detail-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📦 GitHub リポジトリ
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>

          <div class="work-detail-back">
            <a href="/work" class="btn btn-secondary">← 一覧に戻る</a>
          </div>
        </article>
      </div>
    </BaseLayout>
  );
}
