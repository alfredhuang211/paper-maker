import { useI18n } from '../i18n';
import { TOOLS } from '../tools/registry';
import { ToolPreview } from '../components/pattern/ToolPreview';

export function HomePage() {
  const { t } = useI18n();

  return (
    <div className="home">
      <div className="container">
        <section className="hero">
          <span className="eyebrow">{t('common.tagline')}</span>
          <h1>{t('home.heroTitle')}</h1>
          <p>{t('home.heroSubtitle')}</p>
          <div className="feature-row">
            <span>{t('home.feature.local')}</span>
            <span>{t('home.feature.print')}</span>
            <span>{t('home.feature.free')}</span>
          </div>
        </section>

        <div className="tools-heading">
          <h2>{t('home.toolsTitle')}</h2>
        </div>

        <div className="tool-grid">
          {TOOLS.map((tool) => (
            <article className="tool-card" key={tool.slug}>
              <a className="tool-card-body" href={`#/tools/${tool.slug}`}>
                <div className="tool-thumb">
                  <ToolPreview slug={tool.slug} />
                </div>
                <div>
                  <h3>{t(tool.nameKey)}</h3>
                  <p>{t(tool.descKey)}</p>
                </div>
                <span className="card-arrow">
                  {t('common.open')} <span aria-hidden="true">→</span>
                </span>
              </a>
            </article>
          ))}
        </div>

        <p className="action-note" style={{ marginTop: 'var(--space-5)' }}>
          {t('common.homeFooter')}
        </p>
      </div>
    </div>
  );
}
