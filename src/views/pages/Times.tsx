import type { Time } from '../../types';
import { BaseLayout } from '../layouts/BaseLayout';

interface TimesPageProps {
  times: Time[];
}

export function TimesPage({ times }: TimesPageProps) {
  return (
    <BaseLayout
      title="Times - oneamlog"
      description="日々の気づきや思考のつぶやき"
    >
      <div class="container">
        <div class="page-header">
          <h1>💬 Times</h1>
          <p class="page-description">
            日々の気づき、思考、学びをつぶやいています
          </p>
        </div>

        <div class="times-timeline">
          {times.length === 0 ? (
            <p class="no-data">まだTimesがありません。</p>
          ) : (
            times.map((time) => {
              const date = new Date(time.created_at);
              const formattedDate = date.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
              const formattedTime = date.toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <article key={time.id} class="time-item">
                  <div class="time-timestamp">
                    <time datetime={time.created_at}>
                      {formattedDate} {formattedTime}
                    </time>
                  </div>
                  <div class="time-body">
                    <p class="time-content">{time.content}</p>
                    {time.image_url && (
                      <div class="time-image">
                        <img src={time.image_url} alt="" loading="lazy" />
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </BaseLayout>
  );
}
