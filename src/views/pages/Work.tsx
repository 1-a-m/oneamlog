import { BaseLayout } from '../layouts/BaseLayout';
import { WorkCard } from '../components/WorkCard';
import type { Work } from '../../types';

interface WorkProps {
  works: Work[];
}

export function WorkPage({ works }: WorkProps) {
  return (
    <BaseLayout title="Work - oneamlog" description="実績一覧">
      <div class="container">
        <section class="work-page">
          <h1>Work</h1>
          <p class="work-subtitle">これまでに携わったプロジェクトや作成した成果物です</p>

          {works.length === 0 ? (
            <div class="no-works">
              <p>現在、公開できる実績はありません。</p>
            </div>
          ) : (
            <div class="works-grid">
              {works.map((work) => (
                <WorkCard work={work} key={work.id} />
              ))}
            </div>
          )}
        </section>
      </div>
    </BaseLayout>
  );
}
