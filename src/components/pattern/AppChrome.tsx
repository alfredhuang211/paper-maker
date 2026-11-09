import type { ReactNode } from 'react';
import { useI18n } from '../../i18n';
import type { MessageKey } from '../../i18n';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="lang-switch" role="group" aria-label={t('common.language')}>
      <button type="button" aria-pressed={lang === 'zh'} onClick={() => setLang('zh')}>
        {compact ? '中' : t('common.zh')}
      </button>
      <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
        EN
      </button>
    </div>
  );
}

export interface NavItem {
  to: string;
  labelKey: MessageKey;
}

const navItems: NavItem[] = [
  { to: '/', labelKey: 'common.home' },
  { to: '/help/print', labelKey: 'common.printGuide' },
  { to: '/about', labelKey: 'common.about' },
];

export function AppHeader({ currentPath }: { currentPath: string }) {
  const { t } = useI18n();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#/">
          <span>{t('common.brand')}</span>
          <small>{t('common.tagline')}</small>
        </a>
        <nav className="nav" aria-label={t('common.tools')}>
          {navItems.map((item) => (
            <a
              key={item.to}
              className="nav-link"
              href={`#${item.to}`}
              aria-current={currentPath === item.to ? 'page' : undefined}
            >
              {t(item.labelKey)}
            </a>
          ))}
        </nav>
        <LanguageSwitcher />
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span>© 2026 {t('common.brand')}</span>
        <div className="footer-links">
          <a href="#/help/print">{t('common.printGuide')}</a>
          <a href="#/about">{t('common.about')}</a>
          <a href="https://github.com/alfredhuang211/paper-maker" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

export interface ToolIntroProps {
  title: string;
  description: string;
  backLabel?: string;
  children?: ReactNode;
}

export function ToolIntro({ title, description, backLabel, children }: ToolIntroProps) {
  return (
    <div className="tool-intro-wrap">
      <a className="breadcrumb" href="#/">
        ← {backLabel ?? 'All tools'}
      </a>
      <div className="tool-intro">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
