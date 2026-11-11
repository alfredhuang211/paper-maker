import type { ReactNode } from 'react';
import { useI18n } from '../i18n';
import { TOOLS } from '../tools/registry';

function Thumb({ slug }: { slug: string }): ReactNode {
  if (slug === 'math') {
    return (
      <svg viewBox="0 0 180 120" aria-hidden="true">
        <g fill="none" stroke="var(--color-line-strong)" strokeWidth="1">
          <rect x="14" y="12" width="152" height="96" rx="6" />
        </g>
        <g fill="var(--color-ink-secondary)" fontFamily="inherit" fontSize="13">
          <text x="26" y="42">8 + 5 = ____</text>
          <text x="26" y="66">17 − 9 = ____</text>
          <text x="26" y="90">6 × 4 = ____</text>
          <text x="108" y="42">3 + 9 = ____</text>
          <text x="108" y="66">20 ÷ 4 = ____</text>
          <text x="108" y="90">12 − 7 = ____</text>
        </g>
        <circle cx="160" cy="20" r="3" fill="var(--color-accent)" opacity="0.7" />
      </svg>
    );
  }

  if (slug === 'schulte') {
    const numbers = [17, 3, 22, 9, 14, 5, 25, 11, 19, 2, 8, 21, 13, 6, 24, 16, 1, 20, 12, 7, 23, 4, 18, 10, 15];
    return (
      <svg viewBox="0 0 180 120" aria-hidden="true">
        <g transform="translate(52 10)">
          <rect x="0" y="0" width="76" height="76" fill="none" stroke="var(--color-ink-muted)" strokeWidth="1" />
          {Array.from({ length: 25 }).map((_, index) => {
            const column = index % 5;
            const row = Math.floor(index / 5);
            return (
              <g key={index}>
                <rect
                  x={column * 15.2}
                  y={row * 15.2}
                  width="15.2"
                  height="15.2"
                  fill="none"
                  stroke="var(--color-line-strong)"
                  strokeWidth="0.8"
                />
                <text
                  x={column * 15.2 + 7.6}
                  y={row * 15.2 + 10.5}
                  textAnchor="middle"
                  fill="var(--color-ink-secondary)"
                  fontFamily="inherit"
                  fontSize="7"
                >
                  {numbers[index]}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    );
  }

  if (slug === 'maze') {
    return (
      <svg viewBox="0 0 180 120" aria-hidden="true">
        <g fill="none" stroke="var(--color-ink-muted)" strokeWidth="1.4" strokeLinecap="square">
          <rect x="38" y="12" width="104" height="96" />
          <path d="M38 32h28v18H38M66 50h22v20H66M88 70h24v18H88M112 50v-18h18M130 32h12M142 32v58M142 90h-18v-20M124 70h-12M112 70V50M112 50H92M92 50v20M92 70H76" />
        </g>
        <path d="M90 102v8M90 110l-3-4M90 110l3-4" stroke="var(--color-accent)" strokeWidth="1.5" fill="none" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 180 120" aria-hidden="true">
      <g fill="none" stroke="var(--color-ink-muted)" strokeWidth="1.1">
        <circle cx="90" cy="60" r="10" />
        <circle cx="90" cy="60" r="22" />
        <circle cx="90" cy="60" r="34" />
        <circle cx="90" cy="60" r="46" />
        {Array.from({ length: 10 }).map((_, index) => {
          const angle = (index / 10) * Math.PI * 2;
          const inner = 34;
          const outer = 48;
          const x1 = 90 + Math.cos(angle - 0.12) * inner;
          const y1 = 60 + Math.sin(angle - 0.12) * inner;
          const x2 = 90 + Math.cos(angle) * outer;
          const y2 = 60 + Math.sin(angle) * outer;
          const x3 = 90 + Math.cos(angle + 0.12) * inner;
          const y3 = 60 + Math.sin(angle + 0.12) * inner;
          return <path key={index} d={`M ${x1} ${y1} Q ${x2} ${y2} ${x3} ${y3} Z`} />;
        })}
      </g>
      <circle cx="90" cy="60" r="3" fill="var(--color-accent)" opacity="0.7" />
    </svg>
  );
}

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
                  <Thumb slug={tool.slug} />
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
