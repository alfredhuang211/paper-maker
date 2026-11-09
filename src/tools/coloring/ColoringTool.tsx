import { useMemo, useState } from 'react';
import { useI18n } from '../../i18n';
import { useSeed } from '../../hooks/useSeed';
import { Field, SegmentedControl } from '../../components/ui/SegmentedControl';
import { SwitchField } from '../../components/ui/SwitchField';
import { TextField } from '../../components/ui/TextField';
import { ToolIntro } from '../../components/pattern/AppChrome';
import { SeedSettings } from '../../components/pattern/SeedSettings';
import { BatchSettings } from '../../components/pattern/BatchSettings';
import { sheetSeed, type BatchMode } from '../../core/batch';
import { PaperList } from '../../components/pattern/PaperFrame';
import { SheetFooter } from '../../components/pattern/SheetParts';
import { ToolActions } from '../../components/pattern/ToolActions';
import {
  generateColoring,
  type ColoringModel,
  type ColoringTheme,
  type LineWeight,
} from './engine';

export function ColoringTool() {
  const { t } = useI18n();
  const { seed, setSeed, regenerate } = useSeed();
  const [theme, setTheme] = useState<ColoringTheme>('mandala');
  const [complexity, setComplexity] = useState(3);
  const [lineWeight, setLineWeight] = useState<LineWeight>('medium');
  const [title, setTitle] = useState('');
  const [showName, setShowName] = useState(true);
  const [showDate, setShowDate] = useState(false);
  const [sheets, setSheets] = useState(1);
  const [batchMode, setBatchMode] = useState<BatchMode>('different');

  const models = useMemo(
    () =>
      Array.from({ length: sheets }, (_, index) =>
        generateColoring({
          theme,
          complexity,
          lineWeight,
          seed: sheetSeed(seed, index, batchMode),
        }),
      ),
    [theme, complexity, lineWeight, seed, sheets, batchMode],
  );

  const titleText = title.trim() || t('coloring.titleDefault');

  const renderSheet = (model: ColoringModel, index: number) => (
    <div className="sheet">
      <div className="sheet-inner">
        <div className="sheet-header">
          <h1 className="sheet-title">{titleText}</h1>
          <div className="sheet-meta">
            {showName ? (
              <span>
                {t('common.name')}: <span className="meta-line" />
              </span>
            ) : null}
            {showDate ? (
              <span>
                {t('common.date')}: <span className="meta-line" />
              </span>
            ) : null}
          </div>
        </div>

        <div className="coloring-art">
          <svg
            viewBox={`0 0 ${model.width} ${model.height}`}
            role="img"
            aria-label={titleText}
            preserveAspectRatio="xMidYMid meet"
          >
            <g
              fill="none"
              stroke="#000000"
              strokeWidth={model.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {model.elements.map((element, index) =>
                element.kind === 'circle' ? (
                  <circle key={index} cx={element.cx} cy={element.cy} r={element.r} />
                ) : (
                  <path key={index} d={element.d} />
                ),
              )}
            </g>
          </svg>
        </div>

        <SheetFooter seed={sheetSeed(seed, index, batchMode)} />
      </div>
    </div>
  );

  return (
    <div className="tool-page">
      <div className="container">
        <ToolIntro
          title={t('tool.coloring.name')}
          description={t('tool.coloring.desc')}
          backLabel={t('common.allTools')}
        />

        <div className="tool-layout">
          <aside className="panel settings-panel">
            <div className="settings-group">
              <Field label={t('coloring.theme')}>
                <SegmentedControl
                  label={t('coloring.theme')}
                  value={theme}
                  options={[
                    { value: 'symmetry', label: t('coloring.theme.symmetry') },
                    { value: 'mandala', label: t('coloring.theme.mandala') },
                    { value: 'geometric', label: t('coloring.theme.geometric') },
                  ]}
                  onChange={(value) => setTheme(value as ColoringTheme)}
                />
              </Field>
              <Field label={t('coloring.complexity')} help={t('coloring.complexityHint')}>
                <SegmentedControl
                  label={t('coloring.complexity')}
                  value={String(complexity)}
                  options={[1, 2, 3, 4, 5].map((value) => ({
                    value: String(value),
                    label: String(value),
                  }))}
                  onChange={(value) => setComplexity(Number(value))}
                />
              </Field>
              <Field label={t('coloring.lineWidth')}>
                <SegmentedControl
                  label={t('coloring.lineWidth')}
                  value={lineWeight}
                  options={[
                    { value: 'thin', label: t('coloring.line.thin') },
                    { value: 'medium', label: t('coloring.line.medium') },
                    { value: 'thick', label: t('coloring.line.thick') },
                  ]}
                  onChange={(value) => setLineWeight(value as LineWeight)}
                />
              </Field>
            </div>

            <div className="settings-group">
              <SwitchField label={t('common.showName')} checked={showName} onChange={setShowName} />
              <SwitchField label={t('common.showDate')} checked={showDate} onChange={setShowDate} />
            </div>

            <div className="settings-group">
              <TextField
                label={t('common.title')}
                value={title}
                maxLength={30}
                placeholder={t('coloring.titleDefault')}
                onChange={setTitle}
              />
              <p className="action-note">{t('coloring.hint')}</p>
            </div>

            <BatchSettings
              sheets={sheets}
              onSheetsChange={setSheets}
              mode={batchMode}
              onModeChange={setBatchMode}
            />
            <SeedSettings seed={seed} onChange={setSeed} onRegenerate={regenerate} />
          </aside>

          <section className="preview-panel">
            <div className="preview-toolbar">
              <span>
                <strong>{t('common.preview')}</strong> · {t('common.a4')}
              </span>
              <span>{t('common.previewNote')}</span>
            </div>
            <PaperList sheets={models.map((model, index) => renderSheet(model, index))} />
          </section>

          <aside className="actions-panel">
            <ToolActions seed={seed} onSeedChange={setSeed} onRegenerate={regenerate} />
          </aside>
        </div>
      </div>
    </div>
  );
}
