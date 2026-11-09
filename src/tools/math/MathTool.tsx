import { useMemo, useState, type CSSProperties } from 'react';
import { useI18n, type MessageKey } from '../../i18n';
import { useSeed } from '../../hooks/useSeed';
import { formatDate } from '../../core/date';
import { Field, SegmentedControl } from '../../components/ui/SegmentedControl';
import { RangeField } from '../../components/ui/RangeField';
import { SelectField } from '../../components/ui/SelectField';
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
  generateMathWorksheet,
  questionText,
  type CarryMode,
  type MathModel,
  type MathOp,
  type MathParams,
} from './engine';

type FontSize = MathParams['fontSize'];

const FONT_SIZE: Record<FontSize, string> = {
  sm: '10pt',
  md: '12pt',
  lg: '14pt',
  xl: '16pt',
};

const OP_KEYS: { value: MathOp; labelKey: MessageKey }[] = [
  { value: 'add', labelKey: 'math.op.add' },
  { value: 'sub', labelKey: 'math.op.sub' },
  { value: 'mul', labelKey: 'math.op.mul' },
  { value: 'div', labelKey: 'math.op.div' },
];

const PRESETS: {
  key: string;
  labelKey: MessageKey;
  ops: MathOp[];
  range: number;
  count: number;
  carry: CarryMode;
}[] = [
  { key: 'g1', labelKey: 'math.preset.g1', ops: ['add', 'sub'], range: 10, count: 20, carry: 'auto' },
  { key: 'g1b', labelKey: 'math.preset.g1b', ops: ['add', 'sub'], range: 20, count: 20, carry: 'auto' },
  { key: 'g2', labelKey: 'math.preset.g2', ops: ['add', 'sub'], range: 100, count: 20, carry: 'auto' },
  {
    key: 'tables',
    labelKey: 'math.preset.tables',
    ops: ['mul', 'div'],
    range: 100,
    count: 20,
    carry: 'auto',
  },
  {
    key: 'mixed',
    labelKey: 'math.preset.mixed',
    ops: ['add', 'sub', 'mul', 'div'],
    range: 100,
    count: 30,
    carry: 'auto',
  },
];

export function MathTool() {
  const { t, lang } = useI18n();
  const { seed, setSeed, regenerate } = useSeed();
  const [ops, setOps] = useState<MathOp[]>(['add', 'sub']);
  const [range, setRange] = useState(100);
  const [carry, setCarry] = useState<CarryMode>('auto');
  const [count, setCount] = useState(20);
  const [columns, setColumns] = useState(4);
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [showAnswers, setShowAnswers] = useState(true);
  const [showName, setShowName] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [title, setTitle] = useState('');
  const [sheets, setSheets] = useState(1);
  const [batchMode, setBatchMode] = useState<BatchMode>('different');

  const models = useMemo(
    () =>
      Array.from({ length: sheets }, (_, index) =>
        generateMathWorksheet({
          ops,
          range,
          carry,
          count,
          columns,
          fontSize,
          showAnswers,
          title,
          showName,
          showDate,
          seed: sheetSeed(seed, index, batchMode),
        }),
      ),
    [
      ops,
      range,
      carry,
      count,
      columns,
      fontSize,
      showAnswers,
      title,
      showName,
      showDate,
      seed,
      sheets,
      batchMode,
    ],
  );

  const toggleOp = (op: MathOp) => {
    setOps((current) => {
      if (current.includes(op)) {
        return current.length > 1 ? current.filter((item) => item !== op) : current;
      }
      return [...current, op];
    });
  };

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setOps(preset.ops);
    setRange(preset.range);
    setCount(preset.count);
    setCarry(preset.carry);
  };

  const titleText = title.trim() || t('math.titleDefault');

  // Fit the requested number of questions on one A4 page: widen the grid and
  // shrink the type when the count is high. The selected values remain as the
  // user's preference, but the sheet always stays one page.
  const effectiveColumns = Math.min(5, Math.max(columns, Math.ceil(count / 25)));
  const rows = Math.ceil(count / effectiveColumns);
  const selectedSize = FONT_SIZE[fontSize];
  let fitSize = selectedSize;
  let rowGap = '8mm';

  if (rows > 20) {
    fitSize = '8pt';
    rowGap = '1.5mm';
  } else if (rows > 15) {
    fitSize = '9pt';
    rowGap = '2mm';
  } else if (rows > 12) {
    fitSize = '10pt';
    rowGap = '3mm';
  } else if (rows > 8) {
    rowGap = '5mm';
  }

  if (effectiveColumns === 4 && fontSize === 'xl') fitSize = '14pt';
  if (effectiveColumns >= 5) fitSize = rows > 15 ? '8pt' : '9pt';

  const blankWidth = effectiveColumns >= 5 ? '8mm' : effectiveColumns === 4 ? '10mm' : '12mm';
  const layoutAdjusted = effectiveColumns !== columns || fitSize !== selectedSize;

  const questionStyle = {
    '--cols': effectiveColumns,
    '--question-size': fitSize,
    '--row-gap': rowGap,
    '--blank-width': blankWidth,
  } as CSSProperties;

  const renderWorksheet = (model: MathModel, index: number) => (
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
                {t('common.date')}: {formatDate(lang)}
              </span>
            ) : null}
            <span>
              {t('common.score')}: <span className="meta-line" />
            </span>
          </div>
        </div>

        <div className="math-questions" style={questionStyle}>
          {model.questions.map((question, index) => (
            <div className="math-question" key={`${index}-${question.a}-${question.b}-${question.op}`}>
              <span className="math-index">{index + 1}.</span>
              <span>{questionText(question)}</span>
              <span>=</span>
              <span className="math-blank" />
            </div>
          ))}
        </div>

        <SheetFooter seed={sheetSeed(seed, index, batchMode)} />
      </div>
    </div>
  );

  const renderAnswerSheet = (model: MathModel, index: number) => (
    <div className="sheet">
      <div className="sheet-inner">
        <div className="sheet-header">
          <h1 className="sheet-title">{t('math.answerTitle')}</h1>
          <div className="sheet-meta">
            <span>{titleText}</span>
            <span>{formatDate(lang)}</span>
          </div>
        </div>
        <div className="math-answers" style={{ '--cols': 6 } as CSSProperties}>
          {model.questions.map((question, index) => (
            <span className="math-answer" key={`answer-${index}-${question.a}-${question.b}`}>
              <span className="math-index">{index + 1}.</span>
              <span>{question.answer}</span>
            </span>
          ))}
        </div>
        <SheetFooter seed={sheetSeed(seed, index, batchMode)} />
      </div>
    </div>
  );

  const renderedSheets = models.flatMap((model, index) =>
    showAnswers
      ? [renderWorksheet(model, index), renderAnswerSheet(model, index)]
      : [renderWorksheet(model, index)],
  );

  return (
    <div className="tool-page">
      <div className="container">
        <ToolIntro
          title={t('tool.math.name')}
          description={t('tool.math.desc')}
          backLabel={t('common.allTools')}
        />

        <div className="tool-layout">
          <aside className="panel settings-panel">
            <div className="settings-group">
              <span className="field-label">{t('math.preset')}</span>
              <div className="chip-row">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    className="chip"
                    onClick={() => applyPreset(preset)}
                  >
                    {t(preset.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-group">
              <Field label={t('math.ops')}>
                <div className="chip-row">
                  {OP_KEYS.map((operation) => (
                    <button
                      key={operation.value}
                      type="button"
                      className="chip"
                      aria-pressed={ops.includes(operation.value)}
                      onClick={() => toggleOp(operation.value)}
                    >
                      {t(operation.labelKey)}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div className="settings-group">
              <SelectField
                label={t('math.range')}
                value={String(range)}
                options={[10, 20, 50, 100].map((value) => ({
                  value: String(value),
                  label: t(`math.range.${value}` as MessageKey),
                }))}
                onChange={(value) => setRange(Number(value))}
              />
              <Field label={t('math.carry')} help={t('math.carryHint')}>
                <SegmentedControl
                  label={t('math.carry')}
                  value={carry}
                  options={[
                    { value: 'auto', label: t('math.carry.auto') },
                    { value: 'require', label: t('math.carry.require') },
                    { value: 'avoid', label: t('math.carry.avoid') },
                  ]}
                  onChange={(value) => setCarry(value as CarryMode)}
                />
              </Field>
            </div>

            <div className="settings-group">
              <RangeField
                label={t('math.count')}
                value={count}
                min={10}
                max={100}
                step={10}
                onChange={setCount}
              />
              <RangeField
                label={t('math.columns')}
                value={columns}
                min={2}
                max={5}
                onChange={setColumns}
              />
              <Field label={t('math.fontSize')}>
                <SegmentedControl
                  label={t('math.fontSize')}
                  value={fontSize}
                  options={[
                    { value: 'sm', label: t('math.font.sm') },
                    { value: 'md', label: t('math.font.md') },
                    { value: 'lg', label: t('math.font.lg') },
                    { value: 'xl', label: t('math.font.xl') },
                  ]}
                  onChange={(value) => setFontSize(value as FontSize)}
                />
              </Field>
            </div>

            <div className="settings-group">
              <SwitchField
                label={t('math.includeAnswers')}
                checked={showAnswers}
                onChange={setShowAnswers}
              />
              <SwitchField label={t('common.showName')} checked={showName} onChange={setShowName} />
              <SwitchField label={t('common.showDate')} checked={showDate} onChange={setShowDate} />
            </div>

            <div className="settings-group">
              <TextField
                label={t('common.title')}
                value={title}
                maxLength={30}
                placeholder={t('math.titleDefault')}
                onChange={setTitle}
              />
              {models.some((model) => model.warning) ? (
                <p className="warning">{t('math.warning.duplicates')}</p>
              ) : null}
              {layoutAdjusted ? <p className="action-note">{t('math.layoutAdjusted')}</p> : null}
              <p className="action-note">{t('math.hint')}</p>
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
            <PaperList sheets={renderedSheets} />
          </section>

          <aside className="actions-panel">
            <ToolActions seed={seed} onSeedChange={setSeed} onRegenerate={regenerate} />
          </aside>
        </div>
      </div>
    </div>
  );
}
