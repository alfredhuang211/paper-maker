import { useEffect } from 'react';
import { useI18n, type MessageKey } from './i18n';
import { useHashRoute } from './hooks/useHashRoute';
import { AppHeader, SiteFooter } from './components/pattern/AppChrome';
import { HomePage } from './pages/HomePage';
import { PrintGuidePage } from './pages/PrintGuidePage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { getTool } from './tools/registry';

function metaKeyForPath(path: string, toolSlug: string | undefined): MessageKey {
  if (path === '/help/print') return 'meta.printGuide';
  if (path === '/about') return 'meta.about';
  if (toolSlug) return `meta.${toolSlug}` as MessageKey;
  return 'meta.home';
}

export function App() {
  const { path } = useHashRoute();
  const { t } = useI18n();

  const toolSlug = path.startsWith('/tools/') ? path.split('/')[2] : undefined;
  const tool = toolSlug ? getTool(toolSlug) : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [path]);

  useEffect(() => {
    document.title = t(metaKeyForPath(path, tool?.slug));
  }, [path, tool?.slug, t]);

  let content;
  if (path === '/') {
    content = <HomePage />;
  } else if (path === '/help/print') {
    content = <PrintGuidePage />;
  } else if (path === '/about') {
    content = <AboutPage />;
  } else if (path.startsWith('/tools/')) {
    if (tool) {
      const ToolComponent = tool.Component;
      content = <ToolComponent />;
    } else {
      content = <NotFoundPage />;
    }
  } else if (path === '/tools') {
    content = <HomePage />;
  } else {
    content = <NotFoundPage />;
  }


  return (
    <div className="app">
      <AppHeader currentPath={path} />
      <main className="app-main">{content}</main>
      <SiteFooter />
    </div>
  );
}
