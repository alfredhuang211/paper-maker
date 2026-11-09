# 05 · 技术方案（架构设计）

> 版本：v0.3 · 状态：草案 · 日期：2026-11-09
> 本文是**方案设计**，不包含应用代码。技术选型在 M1 启动前可再确认（见 [PRD Q1–Q3](02-prd.md#132-待决策open-questions)）。

## 1. 约束与设计原则

| 约束 | 影响 |
| --- | --- |
| 纯静态、托管 GitHub Pages | 无服务端、无数据库；所有能力在浏览器完成 |
| 无账号、无网络请求 | 生成、预览、导出全部本地；不依赖 API |
| A4 打印是核心 | 版式以 mm 为单位；打印样式与屏幕样式分离 |
| 三个工具共用框架 | 抽象「参数 → 引擎 → 渲染 → 打印」管线，工具可插拔 |
| 后续持续加工具 | 新增工具不应修改核心框架，只需注册 |

设计原则：**核心纯函数化、渲染可替换、状态轻量化、依赖最小化**。

---

## 2. 总体架构

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser (SPA)                        │
│                                                              │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────────┐  │
│  │  UI 层       │   │  状态/URL     │   │  打印/导出层      │  │
│  │  页面/组件    │◄──┤  参数同步     ├──►│  window.print()   │  │
│  │  参数面板     │   │  localStorage │   │  @page / PDF      │  │
│  └──────┬──────┘   └──────────────┘   └──────────────────┘  │
│         │                                                    │
│  ┌──────▼────────────────────────────────────────────────┐  │
│  │              工具注册表（Tool Registry）                │  │
│  │  coloring │ math │ schulte │ ...（元数据 + 参数定义）   │  │
│  └──────┬────────────────────────────────────────────────┘  │
│         │                                                    │
│  ┌──────▼──────────────┐    ┌────────────────────────────┐  │
│  │  生成引擎（纯函数）    │───►│  渲染器（SVG/DOM）          │  │
│  │  seed → model        │    │  A4 页面容器 + 打印样式      │  │
│  └─────────────────────┘    └────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
         │ 构建产物（静态文件）
         ▼
   GitHub Actions → GitHub Pages（CDN）
```

**关键点**：生成引擎不依赖 DOM、不依赖框架，输出可序列化的「页面模型」（题目列表、图形元素、文本），再由渲染器绘制成 SVG/DOM。这样引擎可单测、可快照、可在未来切换渲染方式（如导出 PDF）。

---

## 3. 技术选型

### 3.1 候选对比

| 维度 | 方案 A：Vite + TS + React（推荐） | 方案 B：Vite + TS + Vue | 方案 C：Vite + TS + Svelte | 方案 D：原生 TS + Web Components |
| --- | --- | --- | --- | --- |
| 生态/招聘 | 最成熟 | 成熟 | 较小 | 最小 |
| 包体 | 中（~45KB gzip 框架） | 中 | 小 | 最小 |
| 打印/DOM 控制 | 灵活 | 灵活 | 灵活 | 灵活 |
| 维护者熟悉度 | 高（推断） | 中 | 低 | 中 |
| 组件库依赖 | 可不引入 | 可不引入 | 可不引入 | 无 |

**建议采用方案 A**：Vite + TypeScript + React，**不引入重型 UI 组件库**（表单控件自研，保证打印与包体可控）。若维护者更熟悉 Vue，可平滑替换，架构不变。

### 3.2 关键技术决策

| 领域 | 选择 | 理由 |
| --- | --- | --- |
| 构建 | Vite | 快、静态产物简单、GitHub Pages 友好 |
| 语言 | TypeScript（strict） | 生成引擎参数多，类型约束降低错误 |
| UI | React 18/19 函数组件 | 生态成熟；SSR 不需要 |
| 渲染 | **SVG 优先**，表格/文字用 DOM | 矢量、打印清晰、可精确 mm 定位 |
| 样式 | 原生 CSS + CSS 变量（design tokens）+ CSS Modules | 全站统一 tokens；打印样式完全可控；禁止子应用私有控件样式 |
| 组件 | 自研共享 UI 组件库（不引入重型组件库） | 一致性可控；七态统一；包体小 |
| 状态 | URL 查询参数 + 组件状态；少量 localStorage | 无跨页复杂状态，避免引入 Redux |
| 国际化 | 轻量自研 i18n（中/英文案表 + `navigator.languages` 检测 + localStorage） | 中英双语 P0；不引入 i18next 等重依赖 |
| 路由 | HashRouter（或 History + 404 兜底） | GitHub Pages 无 rewrite，Hash 最稳 |
| 打印 | 原生 `window.print()` + `@page` | 矢量、零依赖、可另存 PDF |
| PDF（P2） | 按需动态加载 `pdf-lib` | 不进入首屏包体 |
| 测试 | Vitest + Playwright | 引擎单测 + 打印 PDF 视觉回归 |
| 部署 | GitHub Actions → Pages artifact | 构建可控，不受分支发布构建频率软限制 |
| 字体 | Noto Sans SC / 思源黑体（OFL） | 可商用、可自托管子集 |
| 包管理 | npm（Node.js 22+） | 与 GitHub Actions 默认缓存兼容，减少额外工具链 |

### 3.3 明确不引入

- ❌ 服务端/SSR/数据库；
- ❌ 第三方分析、广告、客服 SDK；
- ❌ 大型 UI 框架（Ant Design/MUI 等）——表单简单，自研更可控；
- ❌ 重型 i18n 框架（i18next 等）——只有中英两语言、无复杂复数规则，自研更轻；
- ❌ html2canvas（栅格化，打印质量差）。

---

## 4. 目录结构（规划）

```
paper-maker/
├── index.html                 # 入口（M1 后由 Vite 管理）
├── public/                    # 静态资源（favicon、校准页、字体子集）
├── src/
│   ├── main.tsx
│   ├── app/                   # 路由、布局、全局样式
│   │   ├── routes.tsx
│   │   ├── layout/
│   │   └── pages/             # 主页面、About、打印指南、Changelog、styleguide（开发）
│   ├── core/                  # 与框架无关的核心
│   │   ├── random/            # 种子 PRNG、洗牌、采样
│   │   ├── geometry/          # 点/线/多边形/闭合检测
│   │   ├── sheet/             # A4 页面模型、页眉页脚、分页
│   │   ├── print/             # 打印样式、校准页、导出
│   │   └── registry/          # 工具注册表、参数 schema 类型
│   ├── tools/
│   │   ├── coloring/          # engine + renderer + params + presets
│   │   ├── math/              # engine（题型/约束/求值器）+ renderer
│   │   └── schulte/           # engine + renderer
│   ├── components/            # 通用 UI：ui/（共享控件）、pattern/（语言切换、预览、打印操作）
│   ├── i18n/                  # 中英文案表与语言状态（P0）
│   └── styles/                # 全局样式、design tokens、打印样式
├── tests/
│   ├── unit/                  # 引擎单测
│   └── e2e/                   # Playwright（生成→打印 PDF→视觉回归）
├── docs/                      # 本目录
├── .github/workflows/         # CI + Pages 部署
└── package.json
```

---

## 5. 核心模块设计

### 5.1 工具注册表

每个工具是一个「描述对象」：

| 字段 | 说明 |
| --- | --- |
| `id` / `slug` | 唯一标识与 URL |
| `meta` | 名称、描述、图标、关键词（用于主页面/SEO） |
| `params` | 参数 schema（类型、默认值、范围、说明、分组、是否影响内容/布局） |
| `presets` | 预设参数组合 |
| `generate(params, seed)` | 纯函数，返回页面模型 |
| `render(model)` | 返回 React 节点/SVG |
| `exportHints` | 打印提示、答案页策略 |

新增工具时，核心框架（参数面板、预览、打印、种子、URL 同步）**自动复用**；主页面（`/`）由注册表自动生成子应用卡片列表，新增工具无需修改主页面。

### 5.2 随机与确定性

- 使用可种子化的 PRNG（如 mulberry32/xoshiro），**不使用 `Math.random()`**；
- 种子 → 字符串可读形式（如 6 位 base36），支持 URL 传递；
- 同一工具内所有随机决策（洗牌、图形选择）都由同一个种子派生，保证可复现；
- 引擎内部的随机流顺序必须稳定，重构时不得改变已有种子的结果（用快照测试锁定）。

### 5.3 生成引擎

| 引擎 | 输入 | 输出（页面模型） |
| --- | --- | --- |
| coloring | 主题、复杂度、线宽、种子 | 图形元素列表（路径/圆/线），计算好 mm 坐标 |
| math | 题型、范围、进退位、题量、种子 | 题目数组（表达式、答案、编号）+ 答案列表 |
| schulte | 规格、内容类型、种子 | n×n 数字矩阵 + 版式参数 |

**通用要求**：纯函数、无副作用、无 DOM 依赖；输出可 JSON 序列化；单测覆盖所有约束规则。

### 5.4 渲染与打印

- A4 页面容器固定 `210mm × 297mm`，内部按 `@page` 与页边距排布；
- 屏幕预览：用 CSS `transform: scale()` 等比缩放，外层容器滚动；显示纸张边界与边距参考线；
- 打印：通过打印样式隐藏 UI，仅保留纸张容器；`@page { size: A4; margin: 0 }`，内容自留白；
- 批量：多个纸张容器顺序排列，`break-after: page` 分页；
- 打印前校验：测量内容是否溢出容器，溢出则提示。

### 5.5 参数与 URL 同步

- 参数键名简短（如 `g=2&r=100&n=20`），默认值省略；
- 参数变化 → `history.replaceState` 更新 URL（防抖 300ms）；
- 打开链接 → 解析参数 → 校验（越界回退默认）→ 恢复；
- `seed` 单独处理，保证分享可复现。

### 5.6 国际化与语言状态

- 文案表：`src/i18n/zh-CN` 与 `src/i18n/en`，按命名空间组织（`common.*`、`tool.coloring.*`、`tool.math.*`、`tool.schulte.*`、`print.*`）；
- 语言判定优先级：URL `lang`（P1）> localStorage 用户选择 > `navigator.languages` 依次匹配（`zh*` → zh-CN，`en*` → en）> 英文兜底；
- 语言状态放在应用级 Context/Store，切换后全局重渲染；**不刷新页面、不重置工具参数与种子**；
- 同步更新 `<html lang>`、`document.title` 与 meta description；
- **打印内容与界面共用同一套文案表**（`print.*` 命名空间），保证纸面语言与界面一致；生成引擎只输出语言无关数据，文案由渲染层注入；
- 日期/数字格式统一由 i18n 层格式化（`Intl.DateTimeFormat`）；
- 禁止在组件或引擎中硬编码文案；CI 校验中英文键集合一致，缺失 key 在开发环境直接报错；
- 测试：两语言快照 + 缺失 key 检查 + 英文长文案版式溢出检查。

### 5.7 设计系统与响应式实现

- **tokens 单一来源**：`src/styles/tokens.css` 定义色彩/字体/间距/圆角/阴影/动效；组件与页面只引用 `var(--...)`，禁止硬编码；
- **共享组件库**：`src/components/ui/` 提供全部表单与操作控件；子应用禁止复制或覆盖控件样式，只允许通过 props 选择尺寸变体；
- **样式边界**：子应用可自定义的只有「内容渲染样式」（SVG 线稿、网格、A4 纸张）与参数区布局组合；页面骨架、留白、控件外观由 `ToolLayout` 等共享布局组件统一提供；
- **响应式实现**：mobile-first 媒体查询（断点 640 / 1024 / 1440）；使用 CSS Grid/Flex 重排，不使用 JS 监听窗口宽度做布局；预览用 `transform: scale()` 适配容器；打印使用独立 `@media print`，与断点解耦；
- **一致性检查**：stylelint 规则禁止 token 之外的颜色/间距、禁止 `!important` 覆盖共享组件；`/styleguide` 展示全部组件七态；Playwright 在 360/768/1440 × 中英下截图回归；
- **性能**：tokens 用一个 CSS 文件，组件按路由与使用情况拆分，避免为一致性引入重型组件库。

---

## 6. 路由与 GitHub Pages

| 方案 | 做法 | 优点 | 缺点 | 结论 |
| --- | --- | --- | --- | --- |
| **Hash 路由** | `/#/tools/math` | 无需服务端配置，永不 404 | URL 不够美观 | ✅ 推荐 |
| History + 404 兜底 | 复制 `index.html` 为 `404.html` | URL 美观 | 依赖 404 行为，首次加载路径需处理 | 备选 |

- 项目页必须设置 Vite `base: '/paper-maker/'`；
- 资源使用相对/`base` 前缀，避免绝对根路径；
- 自定义域名或用户页（`<user>.github.io`）时改为 `base: '/'`。

---

## 7. 构建与部署

### 7.1 目标流程（M1 起）

```
push main
   │
   ▼
GitHub Actions
   ├─ npm ci
   ├─ npm test && npm run build（输出 dist/）
   ├─ actions/upload-pages-artifact
   └─ actions/deploy-pages → https://alfredhuang211.github.io/paper-maker/
```

- 权限：`pages: write`、`id-token: write`；
- 环境：`github-pages`；
- 并发控制：同一分支只保留最新部署。

### 7.2 当前状态（M1/M2）

- Vite + TypeScript + React 应用已实现；`npm run build` 产出 `dist/`；
- 通过 [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) 构建、测试并使用 Actions artifact 发布；
- 当前线上地址：<https://alfredhuang211.github.io/paper-maker/>（项目站点，`base: '/paper-maker/'`）；
- 自定义域名尚未配置；未来切换时按 §7.4 执行。

### 7.3 Pages 限制（需遵守）

| 限制 | 值 |
| --- | --- |
| 站点大小 | ≤ 1 GB |
| 月流量（软限制） | 100 GB |
| 部署超时 | 10 分钟 |
| 分支发布构建频率（软限制） | 10 次/小时（Actions 发布不受此限） |

> 来源：<https://docs.github.com/zh/pages/getting-started-with-github-pages/github-pages-limits>

### 7.4 域名策略（已定 · 2026-11-09）

| 阶段 | 域名 | 说明 |
| --- | --- | --- |
| 当前（M0–M1） | `https://alfredhuang211.github.io/paper-maker/` | 使用 GitHub Pages 默认项目地址，暂不配置自定义域名 |
| 后续（M2 之后任意时点） | 自有域名的子域（如 `papermaker.<维护者域名>`） | 维护者提供域名与 DNS 控制权后切换；详见下方清单 |

**后续切换自有子域清单**

1. 在仓库 Settings → Pages 填写 Custom domain，并完成域名验证（TXT 记录）；
2. 在 DNS 服务商为子域添加 `CNAME` → `alfredhuang211.github.io`（**不要**带仓库名）；若使用 Cloudflare，建议先设为 DNS only（灰云）；
3. 分支发布时 GitHub 会自动在发布分支根目录提交 `CNAME` 文件，本地先 `git pull`；改用 Actions 发布后无需 `CNAME` 文件；
4. Vite `base` 从 `/paper-maker/` 改为 `/`，并同步更新 README、文档与分享链接中的地址；
5. 证书签发后启用 **Enforce HTTPS**，验证 `https://<子域>/`；
6. 旧地址 `https://alfredhuang211.github.io/paper-maker/` 预期跳转到新域名（以实测为准）；
7. 更新仓库 homepage 设置与文档中的线上地址。

**约束**：GitHub Pages 不支持 `papermaker.alfredhuang211.github.io` 这类 `github.io` 二级子域（只有 `<owner>.github.io` 与 `<owner>.github.io/<repo>` 两种默认形态），自定义域名必须是维护者自有、可控 DNS 的域名。

---

## 8. 质量保障

| 层次 | 手段 | 门槛 |
| --- | --- | --- |
| 静态检查 | TypeScript strict、ESLint、Prettier | 0 error |
| 单元测试 | 生成引擎、约束规则、种子复现、参数解析 | 引擎覆盖率 ≥ 90% |
| 快照测试 | 固定种子 → 页面模型快照；改动需显式更新 | 快照差异需评审 |
| 国际化 | 中英文快照 + 缺失 key 检查 + 英文长文案版式检查 | 两语言 0 缺失文案、0 溢出 |
| 打印回归 | Playwright 生成页面 → 打印 PDF → 与基准 PDF 比对版式 | 允许像素差阈值 |
| 视觉回归 | Playwright 截图：360/768/1440 × 中英 × 主页面/子应用/组件示例 | 差异需评审；无横向滚动 |
| 设计一致性 | stylelint（禁止 tokens 之外样式）+ 组件使用检查 | 子应用 0 处私有控件样式 |
| 视觉检查 | 三工具各 5 组参数，人工看样张 | 打印验收清单通过 |
| 性能 | Lighthouse CI | Perf/A11y/BP ≥ 90 |
| 兼容 | 多浏览器手测 + Playwright 矩阵 | 最近 2 个大版本 |

**打印 PDF 回归思路**：CI 中用 Chromium `page.pdf({ format: 'A4' })` 输出，解析页数、检查关键坐标（如页边距、网格边界），并做基准图对比。这能有效防止「改样式导致打印错位」。

---

## 9. 性能预算

| 项 | 预算 |
| --- | --- |
| 首屏 JS（gzip） | ≤ 150 KB |
| 单个工具 chunk | ≤ 60 KB |
| 首屏 LCP | ≤ 2.5 s（4G 中端机） |
| 生成单页 | ≤ 200 ms |
| 批量 20 页 | ≤ 2 s |
| 字体 | 中文 Noto Sans SC 子集 + 英文 Inter / system-ui；woff2；首屏仅 1 个字重 |
| 图片 | 尽量无位图；图标用内联 SVG |

策略：路由级代码分割；生成引擎与渲染器同工具打包；pdf-lib 等可选依赖动态 `import()`。

---

## 10. 隐私与安全

- 无后端、无 API、无第三方脚本；所有生成在本地内存完成；
- 不设置追踪 Cookie；localStorage 仅存用户预设与最近参数，提供清除入口；
- 分享链接可能包含用户输入的标题/姓名，提示用户注意；不上传；
- 安全：不把用户输入拼进 `innerHTML`；CSP 允许内联样式（打印需要）但限制外链；
- 依赖：锁定版本、定期 `npm audit`；不引入来源不明的生成库。

---

## 11. 新增工具的检查清单

新增一个生成器时，按以下步骤接入（不改核心框架）：

1. 在 `src/tools/<name>/` 定义参数 schema 与预设；
2. 实现 `generate(params, seed)` 纯函数，输出页面模型；
3. 实现渲染器（SVG/DOM），遵守 mm 布局；
4. 注册工具元数据（主页面卡片、路由、SEO）；
5. 补充单测（约束、种子复现、边界）与快照；
6. 补充打印验收（至少 5 组参数样张）；
7. 使用共享组件与 design tokens，不新增私有控件样式；
8. 通过 360/768/1440 × 中英文视觉回归与自适应检查；
9. 更新 README、文档索引、Changelog。

**评估标准**：新工具是否复用 ≥ 80% 通用能力；是否引入新的外部依赖；打印版式、视觉一致性与响应式是否通过验收。

---

## 12. 风险与备选方案

| 风险 | 备选 |
| --- | --- |
| 打印跨浏览器不一致 | 提供校准页 + 打印指南；优先保障 Chromium；Safari 单独测试 |
| Vite `base` 配置错误导致资源 404 | 部署后用 Playwright 冒烟测试线上 URL |
| 生成引擎重构破坏种子复现 | 快照测试锁定固定种子输出 |
| 包体超预算 | 路由分割、字体子集、移除未用依赖 |
| 后续需要精确 PDF | P2 引入 pdf-lib，复用页面模型的 mm 坐标直接绘制 |
| React 迁移成本 | 架构与框架解耦（core 纯 TS），必要时可换 UI 框架 |
