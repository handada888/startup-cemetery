import ParticleBg from '../components/ParticleBg';
import './AboutPage.scss';

export default function AboutPage() {
  return (
    <div className="page about-page">
      <ParticleBg />
      <header className="about-page__header">
        <span className="about-page__logo">🪦</span>
        <h1>创业墓地</h1>
        <p className="about-page__version">v1.0.0</p>
      </header>

      <div className="about-page__content">
        <section className="about-section">
          <h2>📖 项目介绍</h2>
          <p>
            创业墓是一个专门记录和复盘失败创业公司案例的平台。我们相信，从失败中学习比从成功中学习更有价值。
            每一家倒下的公司都承载着宝贵的经验教训，值得被铭记和分析。
          </p>
        </section>

        <section className="about-section">
          <h2>🎯 我们的使命</h2>
          <p>
            通过公开、透明地记录失败创业案例，帮助创业者避开常见的陷阱，
            提高创业成功率。让「失败」不再是禁忌话题，而是整个创业生态中最宝贵的公共资源。
          </p>
        </section>

        <section className="about-section">
          <h2>📊 数据来源</h2>
          <p>
            本平台的数据来源于公开报道、行业研究报告、企业公告以及用户投稿。
            我们努力确保数据的准确性，但无法保证每条信息的完全精确。
            如果您发现数据有误，欢迎通过投稿功能提交修正。
          </p>
        </section>

        <section className="about-section">
          <h2>🤝 参与贡献</h2>
          <p>
            您可以通过以下方式参与贡献：
          </p>
          <ul>
            <li>📝 提交您了解的失败创业案例</li>
            <li>🔧 补充和修正现有案例信息</li>
            <li>🕯️ 为值得铭记的公司「上香」</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>🔧 管理后台</h2>
          <p>
            <a href="#/admin" style={{ color: 'var(--accent)', fontWeight: 600 }}>点击进入管理后台 →</a>
            <br />可在后台增删改查所有案例数据。
          </p>
        </section>

        <section className="about-section about-section--disclaimer">
          <h2>⚠️ 免责声明</h2>
          <p>
            本平台所有内容仅供参考学习之用，不构成任何投资建议。
            平台数据基于公开信息整理，可能存在偏差。
            用户投稿内容仅代表投稿者个人观点，不代表本平台立场。
            如涉及侵权或信息错误，请联系我们进行修正。
          </p>
        </section>

        <footer className="about-page__footer">
          <p>🪦 铭记失败，致敬创业者</p>
          <p className="about-page__copyright">© 2024 创业墓地 · 仅供学习参考</p>
        </footer>
      </div>
    </div>
  );
}
