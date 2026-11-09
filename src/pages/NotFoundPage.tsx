import { useI18n } from '../i18n';

export function NotFoundPage() {
  const { t } = useI18n();
  return (
    <div className="guide-page">
      <div className="container" style={{ textAlign: 'center', paddingTop: '10vh' }}>
        <h1 style={{ fontSize: 'clamp(32px, 6vw, 48px)', marginBottom: 'var(--space-3)' }}>
          {t('notFound.title')}
        </h1>
        <p style={{ color: 'var(--color-ink-secondary)' }}>{t('notFound.desc')}</p>
        <p style={{ marginTop: 'var(--space-5)' }}>
          <a className="btn btn-primary" href="#/">
            {t('notFound.back')}
          </a>
        </p>
      </div>
    </div>
  );
}
