import { BaseLayout } from '../layouts/BaseLayout';

export function About() {
  return (
    <BaseLayout title="About - oneamlog" description="エンジニアとしての経歴">
      <div class="container">
        <section class="about">
          <h1>About Me</h1>

          <div class="about-content">
            <h2>経歴</h2>
            <div class="timeline">
              <div class="timeline-item">
                <h3>現在</h3>
                <p>インフラエンジニアとして活躍中</p>
                <p>主に AWS, Google Cloud, Azure のインフラ構築に従事</p>
              </div>
              <div class="timeline-item">
                <h3>これまで</h3>
                <p>1997年生まれ</p>
                <p>クラウドインフラの設計・構築を中心に活動</p>
              </div>
            </div>

            <h2>技術スタック</h2>
            <p>マルチクラウド環境でのインフラ設計・構築を得意としています。</p>
            <ul>
              <li>クラウド: AWS, Google Cloud, Azure</li>
              <li>バックエンド: Python, Go, Node.js</li>
              <li>コンテナ: Docker, Kubernetes</li>
              <li>IaC: Terraform, CloudFormation</li>
              <li>CI/CD: GitHub Actions, GitLab CI</li>
              <li>データベース: PostgreSQL, MySQL, DynamoDB</li>
            </ul>

            <h2>興味・関心</h2>
            <p>クラウドネイティブアーキテクチャ、Infrastructure as Code、SRE（Site Reliability Engineering）、コスト最適化に興味があります。</p>
          </div>
        </section>
      </div>
    </BaseLayout>
  );
}
