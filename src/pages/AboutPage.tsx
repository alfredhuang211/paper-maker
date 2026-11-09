import { useI18n } from '../i18n';

export function AboutPage() {
  const { t } = useI18n();

  return (
    <div className="about-page">
      <div className="container about-content">
        <a className="breadcrumb" href="#/">
          ← {t('common.backHome')}
        </a>
        <h1>{t('about.title')}</h1>
        <p>{t('about.intro')}</p>

        <h2>{t('about.principlesTitle')}</h2>
        <p>{t('about.principle1')}</p>
        <p>{t('about.principle2')}</p>
        <p>{t('about.principle3')}</p>

        <h2>{t('about.privacyTitle')}</h2>
        <p>{t('about.privacyText')}</p>

        <h2>{t('about.licenseTitle')}</h2>
        <p>{t('about.licenseText')}</p>

        <h2>{t('about.sourceTitle')}</h2>
        <p>
          {t('about.sourceText')}{' '}
          <a href="https://github.com/alfredhuang211/paper-maker" target="_blank" rel="noreferrer">
            github.com/alfredhuang211/paper-maker
          </a>
        </p>
        <p>{t('about.madeWith')}</p>
      </div>
    </div>
  );
}
