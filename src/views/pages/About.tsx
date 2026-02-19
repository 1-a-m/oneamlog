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
                <h3>2024年10月〜現在</h3>
                <p>同業種に転職し、主に請負でクラウド周りの設計構築に従事</p>
              </div>
              <div class="timeline-item">
                <h3>2020年4月〜</h3>
                <p>Web制作会社にインフラエンジニアとして入社</p>
              </div>
            </div>

            <h2>得意分野</h2>
            <ul>
              <li>AWSでのインフラ設計・構築</li>
              <li>PHPによるWebアプリケーション開発</li>
            </ul>

            <h2>技術スタック</h2>
            <ul>
              <li>クラウド: AWS（EC2, Lambda, S3, CloudFront, CodePipeline, RDS）</li>
              <li>バックエンド: PHP（Laravel）, Python, Node.js</li>
              <li>フロントエンド: HTML, CSS（Sass）, JavaScript（jQuery）</li>
              <li>IaC: CDK（TypeScript）</li>
              <li>コンテナ: Docker</li>
              <li>データベース: Oracle, PostgreSQL</li>
              <li>OS: RHEL, Linux</li>
              <li>その他: Tableau, 機械学習（画像認識）</li>
            </ul>

            <h2>資格</h2>
            <ul>
              <li>AWS Certified Solutions Architect - Associate（2021年10月）</li>
              <li>AWS Certified Solutions Architect - Professional（2022年11月）</li>
              <li>AWS Certified Data Analytics - Specialty（2023年2月）</li>
            </ul>
          </div>
        </section>
      </div>
    </BaseLayout>
  );
}
