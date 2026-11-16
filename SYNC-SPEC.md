# money.itis.chat 同步规范（SYNC-SPEC）

版本：v1（2026-11-16 首发版）
站点：搞钱项目库 / Money Project Library — https://money.itis.chat
仓库：ai717/money.itis.chat（public，main 分支，GitHub Pages + 自定义域名）
本地站源：~/workspace/money-site/；组包脚本：~/workspace/money-site-build/

## 1. 定位与数据源

- 本站是「搞钱项目」看板（Muse 空间 `gao-qian-xiang-mu`）的公开独立站，与看板同源同数据。
- 唯一数据源：看板 getstate 动作的结构化导出（按期导出 projects / warnings / categories / issues）。
- 站点数据模型（data.json / data-en.json 全量累积）：
  - `categories`：31 个分类，**分类 id 与看板完全一致、不许改**（1–26、29、30、34、35、36），每个分类带 `group`（7 个分组：AI 与数字产品 / 流量与网站 / 内容与自媒体 / 电商与交易 / 服务与接单 / 线下与实体 / 信息差与趋势）。
  - `issues`：期次列表（id、date、projectCount、warningCount、status）。
  - `projects`：项目卡，站点 id 按期次顺序全局连续重排（1..N）；字段 title/what/moneyLogic/incomeEvidence/cost/timeCost/risks/firstStep/matchScore/matchReason/categoryId/issueDate/featured/source{name,grade,url}。每期至多 1 个 featured，全站恰好 1 个（最新一期头条）。
  - `warnings`：避坑独立集合，站点 id 全局连续；字段 title/reason/categoryId（可为 null）/issueDate/source{name,url}。详情页走 `/warning/<id>/`（与项目 `/project/<id>/` 并列的独立详情体系）。

## 2. 同步节奏（与 muse v3 / grokbot 同款：直发 + 发后通知）

- 看板每周一、三、五、日 10:00 刷新后，当期新数据组包 → 本地跑门禁（见 §5）→ 直发 GitHub（单提交推送 main）→ **发后邮件通知 evergreen333@gmail.com**（主题注明期次、项目/避坑增量与全量数），不再等审核回执。
- 日常同步只需更新 data.json / data-en.json 并推送：仓库内 `.github/workflows/sync-on-data-push.yml` 会在 data 文件变更时自动运行 `node sync-site-seo.js` 并回提交生成的静态层（index.html、en/index.html、sitemap.xml、data-fallback.js、data-en-fallback.js、project/、warning/）。
- 首次或大改版时本地先实跑 `node sync-site-seo.js` 验证，再整站推送。

## 3. 投稿与手动收录

- **投稿即批准**：狗爸爸邮件/对话投递的搞钱项目，核验通过即收录上站，不再走审核。
- **手动投稿按信源发布日期定期次，绝不用看板刷新日冒充期次日期**（app_creation_manual_submission_dates 规矩）：手动收录条目的 issueDate 必须取其来源发布/投稿日期所属期次；若独立成期，issue 备注注明「用户投稿专期」。
- 以 sourceUrl 去重：同一原文链接全站只收一次。

## 4. 双语与数字纪律

- 英文版流程：Pi 免费模型出初稿（默认 nvidia/nemotron-3-ultra-550b-a55b:free，降级顺序 Ultra → super-vl → inkling-2-small）→ 总管逐条核数字定版。
- **收入证据、成本等字段里的金额、百分比、月份数、份数必须与中文原文逐个一致**；Pi 稿数字一律不可信，核对脚本（build_en.py 的数字多重集比对）报警项必须逐条人工确认后才可发布。
- 货币不换算：元/¥、美元/$、英镑/£、欧元/€ 原样保留。

## 5. 发布门禁（全过才推）

`node sync-site-seo.js` 内置校验，任一不过即中止：
- 项目/避坑 id 全局从 1 连续无跳号；
- 中英条数与逐条对齐（分类、匹配分、期次、信源链接一致）；
- 分类 id 在 31 类白名单内；featured 恰好 1 个；
- 必填字段齐全（incomeEvidence 允许为空——原文未披露时详情页显示提示语，不编造）；
- 信源完整（name + grade A/B/C + url；避坑为 name + url）；
- JSON-LD：首页中英各恰好 1 个 ld+json 块且可解析（@graph 含 WebSite/CollectionPage/FAQPage）。

推送后验收：仓库文件齐全、Actions（sync-on-data-push）成功、https://ai717.github.io/money.itis.chat/ 可访问且为新版；正式域名待 DNS 生效后另验。

## 6. 站点结构

- `/` 中文首页、`/en/` 英文全副本（app.js 双语数据并行加载，file:// 时走 data-fallback.js 回退）。
- `/project/<id>/` 项目详情页、`/warning/<id>/` 避坑详情页（均由 sync 脚本静态生成，含独立 JSON-LD）。
- 收藏「想做的」：localStorage 键 `money_project_favorites_v1`；语言偏好键 `money_site_lang_v1`。
- 主题：暖亮模式（暖纸底 #f5efe6 + 白卡片），点缀色金/琥珀（--accent-caramel: #b45309），与 muse（蓝）/grokbot（青柠绿）区分。
- 页脚友链：Muse实战案例（muse.itis.chat）、GrokBot实战案例（grokbot.itis.chat）、AI薅羊毛日报（hao.itis.chat）、摸鱼杂货店、搞钱实验室、小游戏大全、AI资源导航。

## 7. DNS（狗爸爸侧）

- 正式域名需在 DNS 添加：`money` 子域名 CNAME → `ai717.github.io`（与 muse/hao/grokbot 同法）。生效后仓库根目录 CNAME 文件（已含 money.itis.chat）即完成绑定。

## 8. 站点装修基线（2026-11-16 上线打磨定版，同步时勿回退）

以下改动全部落在生成源头（`sync-site-seo.js` 模板/逻辑、`style.css`、根目录静态文件），每次数据同步重生成都会自动带上；改模板或样式时不得删改本节内容。

- **统计代码**：GTM 容器 **GTM-T625G32G**（狗爸爸 2026-11-16 提供）。`sync-site-seo.js` 的 `GA_SNIPPET` + `injectGA()` 把代码原样注入每个页面 `<head>` 之后（中英首页、全部详情页；幂等，含容器号即跳过）。`404.html` 为静态文件、已手动注入同一代码，勿删。
- **图标体系**：金币 ¥ 主题（暖纸底 #f5efe6 + 金/琥珀 #b45309）。`favicon.svg`（全出血金币）+ `favicon-32.png` / `favicon-16.png`（由 favicon.svg 导出）；`money-icon.svg`（暖纸方砖版，详情页顶栏品牌图）+ `apple-touch-icon.png`（180）/ `icon-192.png` / `icon-512.png`（由 money-icon.svg 导出）；`og-image.png`（1200×630 社交卡）。所有页面 head 经 `iconLinksHtml()` 或静态引用统一挂载，含 `site.webmanifest`。og:image / twitter:image 一律用 `https://money.itis.chat/og-image.png`（勿再用 SVG，社交平台不渲染）。
- **SEO 基线**：每页 unique title/description（详情页 description 经 `metaDesc()` 截断 160 字）、canonical、robots（index,follow,max-*）、OG/Twitter 卡片齐全（避坑页也带 Twitter）；首页中英 hreflang 互指 + x-default，sitemap.xml 内首页条目带 xhtml:link alternates；详情页只有中文一版，不加 hreflang（无英文详情页，加了反而错误）。sitemap 共 134 条（2 首页 + 83 项目 + 18 避坑 + 31 分类），URL 全为正式域名，lastmod 用期次日期/当日。
- **viewport**：统一 `width=device-width, initial-scale=1.0`，禁止再加 `maximum-scale/user-scalable=no`（伤无障碍与移动体验）。
- **长文本与移动端 CSS**（`style.css` 末尾「2026-11-16 上线打磨」段）：标题/正文类 `overflow-wrap: break-word`、英文页 `hyphens: auto`、徽标行/统计行/卡片页脚允许 wrap、信源名不再 nowrap 省略号截断、顶栏 flex 子项 `min-width: 0` 防 min-content 撑破（375px 实测修过 brand-wrap/stats-panel 右缘溢出）、避坑网格 `minmax(min(320px,100%),1fr)`、移动端输入框 16px 防 iOS 聚焦缩放、分类按钮 min-height 36px。卡片 valueline/reason 的 3 行 line-clamp 是双语一致的设计截断，保留。
