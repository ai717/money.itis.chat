/**
 * sync-site-seo.js — money.itis.chat
 * data.json / data-en.json 更新后运行：
 * 1. 生成 data-fallback.js 与 data-en-fallback.js
 * 2. 生成 project/<id>/ 与 warning/<id>/ 独立静态落地页（含 JSON-LD）
 * 3. 更新 index.html 与 en/index.html 的 JSON-LD、计数文案与预渲染卡片
 * 4. 全量重建 sitemap.xml
 * 门禁不通过则退出码 1 中止（id 连续、中英对齐、分类白名单、必填齐全、信源完整）。
 */

const fs = require('fs');
const path = require('path');

const GA_SNIPPET = ``; // 暂无 GTM 容器，不注入统计代码
const BASE = 'https://money.itis.chat';

function injectGA(html) {
  if (!GA_SNIPPET) return html;
  if (html.includes('GTM-')) return html;
  return html.replace('</head>', `${GA_SNIPPET}\n</head>`);
}

const FOOTER_LINKS_HTML_ZH = `        <div class="footer-links">
          <span class="footer-links-label">友情链接：</span>
          <a href="https://www.moyunews.com/" target="_blank" rel="noopener noreferrer">摸鱼杂货店</a>
          <span class="footer-links-sep">&bull;</span>
          <a href="https://muse.itis.chat/" target="_blank" rel="noopener noreferrer">Muse实战案例</a>
          <span class="footer-links-sep">&bull;</span>
          <a href="https://grokbot.itis.chat/" target="_blank" rel="noopener noreferrer">GrokBot实战案例</a>
          <span class="footer-links-sep">&bull;</span>
          <a href="https://hao.itis.chat/" target="_blank" rel="noopener noreferrer">AI薅羊毛日报</a>
          <span class="footer-links-sep">&bull;</span>
          <a href="https://m.ucncn.cn/" target="_blank" rel="noopener noreferrer">搞钱实验室</a>
          <span class="footer-links-sep">&bull;</span>
          <a href="https://doin.win/" target="_blank" rel="noopener noreferrer">小游戏大全</a>
          <span class="footer-links-sep">&bull;</span>
          <a href="https://itis.chat/" target="_blank" rel="noopener noreferrer">AI资源导航</a>
        </div>`;

const FOOTER_LINKS_HTML_EN = `        <div class="footer-links">
          <span class="footer-links-label">Friendly Links:</span>
          <a href="https://www.moyunews.com/" target="_blank" rel="noopener noreferrer">MoyuNews</a>
          <span class="footer-links-sep">&bull;</span>
          <a href="https://muse.itis.chat/" target="_blank" rel="noopener noreferrer">Muse Case Library</a>
          <span class="footer-links-sep">&bull;</span>
          <a href="https://grokbot.itis.chat/" target="_blank" rel="noopener noreferrer">GrokBot Case Library</a>
          <span class="footer-links-sep">&bull;</span>
          <a href="https://hao.itis.chat/" target="_blank" rel="noopener noreferrer">Deals Daily</a>
          <span class="footer-links-sep">&bull;</span>
          <a href="https://m.ucncn.cn/" target="_blank" rel="noopener noreferrer">MoneyLab</a>
          <span class="footer-links-sep">&bull;</span>
          <a href="https://doin.win/" target="_blank" rel="noopener noreferrer">Free Mini Games</a>
          <span class="footer-links-sep">&bull;</span>
          <a href="https://itis.chat/" target="_blank" rel="noopener noreferrer">AI Navigation</a>
        </div>`;

function injectFooterLinks(html, isEn = false) {
  const linksHtml = isEn ? FOOTER_LINKS_HTML_EN : FOOTER_LINKS_HTML_ZH;
  if (html.includes('class="footer-links"')) {
    return html.replace(/<div class="footer-links">[\s\S]*?<\/div>/i, linksHtml.trim());
  }
  return html.replace(/(<div class="footer-content">)/i, `$1\n${linksHtml}`);
}

function replaceElementInner(html, elId, newInner) {
  const openRe = new RegExp(`<div[^>]*id="${elId}"[^>]*>`);
  const m = html.match(openRe);
  if (!m) throw new Error(`element #${elId} not found`);
  const start = m.index + m[0].length;
  const tagRe = /<(\/?)div\b[^>]*?(\/?)>/g;
  tagRe.lastIndex = start;
  let depth = 1, t;
  while ((t = tagRe.exec(html)) !== null) {
    if (t[2] === '/') continue;
    if (t[1] === '/') {
      depth -= 1;
      if (depth === 0) return html.slice(0, start) + newInner + html.slice(t.index);
    } else {
      depth += 1;
    }
  }
  throw new Error(`unbalanced div for #${elId}`);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function validateData(dataZh, dataEn) {
  console.log('🔍 执行数据完整性与双语对齐门禁校验...');
  const errors = [];
  const warnings = [];

  if (!Array.isArray(dataZh.projects) || !Array.isArray(dataEn.projects)) {
    errors.push('data.json 或 data-en.json 缺少 projects 数组！');
    return { ok: false, errors, warnings };
  }
  if (!Array.isArray(dataZh.warnings) || !Array.isArray(dataEn.warnings)) {
    errors.push('data.json 或 data-en.json 缺少 warnings 数组！');
    return { ok: false, errors, warnings };
  }
  if (dataZh.projects.length !== dataEn.projects.length) {
    errors.push(`中英文项目数量不一致：中文 ${dataZh.projects.length} vs 英文 ${dataEn.projects.length}！`);
  }
  if (dataZh.warnings.length !== dataEn.warnings.length) {
    errors.push(`中英文避坑数量不一致：中文 ${dataZh.warnings.length} vs 英文 ${dataEn.warnings.length}！`);
  }

  const validCategories = new Set(dataZh.categories.map(c => c.id));
  if (validCategories.size !== 31) errors.push(`分类应为 31 个，实际 ${validCategories.size} 个！`);
  const validGrades = new Set(['A', 'B', 'C']);
  const enProj = new Map(dataEn.projects.map(p => [p.id, p]));
  const required = ['title', 'what', 'moneyLogic', 'cost', 'timeCost', 'risks', 'firstStep', 'matchReason'];

  dataZh.projects.forEach((pz, index) => {
    if (pz.id !== index + 1) {
      errors.push(`项目 id 未连续：位置 ${index + 1} 上的 id 为 ${pz.id}`);
    }
    if (!validCategories.has(pz.categoryId)) {
      errors.push(`项目 [${pz.id}] 分类 ${pz.categoryId} 不在 31 类白名单中！`);
    }
    required.forEach(f => {
      if (!pz[f] || String(pz[f]).trim() === '') errors.push(`项目 [${pz.id}] 中文缺少必填字段: ${f}`);
    });
    if (!pz.source || !pz.source.name || !pz.source.url || !validGrades.has(pz.source.grade)) {
      errors.push(`项目 [${pz.id}] 信源不完整（name/grade(A/B/C)/url）！`);
    }
    if (typeof pz.matchScore !== 'number') errors.push(`项目 [${pz.id}] matchScore 非数字！`);
    const pe = enProj.get(pz.id);
    if (!pe) {
      errors.push(`英文数据缺失 id=${pz.id}`);
    } else {
      if (pe.categoryId !== pz.categoryId) errors.push(`项目 [${pz.id}] 中英文分类不一致`);
      if (pe.matchScore !== pz.matchScore) errors.push(`项目 [${pz.id}] 中英文匹配分不一致: ${pz.matchScore} vs ${pe.matchScore}`);
      if (pe.source?.url !== pz.source?.url) errors.push(`项目 [${pz.id}] 中英文信源链接不一致`);
      if (pe.issueDate !== pz.issueDate) errors.push(`项目 [${pz.id}] 中英文期次日期不一致`);
      required.forEach(f => {
        if (!pe[f] || String(pe[f]).trim() === '') errors.push(`项目 [${pz.id}] 英文缺少必填字段: ${f}`);
      });
    }
  });

  const enWarn = new Map(dataEn.warnings.map(w => [w.id, w]));
  dataZh.warnings.forEach((wz, index) => {
    if (wz.id !== index + 1) errors.push(`避坑 id 未连续：位置 ${index + 1} 上的 id 为 ${wz.id}`);
    if (!wz.title || !wz.reason) errors.push(`避坑 [${wz.id}] 缺少 title/reason！`);
    if (!wz.source || !wz.source.name || !wz.source.url) errors.push(`避坑 [${wz.id}] 信源不完整！`);
    if (wz.categoryId !== null && wz.categoryId !== undefined && !validCategories.has(wz.categoryId)) {
      errors.push(`避坑 [${wz.id}] 分类 ${wz.categoryId} 不在白名单中！`);
    }
    const we = enWarn.get(wz.id);
    if (!we) errors.push(`英文避坑缺失 id=${wz.id}`);
    else {
      if (!we.title || !we.reason) errors.push(`英文避坑 [${wz.id}] 缺少 title/reason！`);
      if (we.source?.url !== wz.source?.url) errors.push(`避坑 [${wz.id}] 中英文信源链接不一致`);
    }
  });

  const featured = dataZh.projects.filter(p => p.featured);
  if (featured.length !== 1) errors.push(`featured 项目应恰好 1 个，实际 ${featured.length} 个！`);

  return { ok: errors.length === 0, errors, warnings };
}

function projectPageHtml(p, catName, totalProjects, dataZh) {
  const schemaObj = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": p.title,
    "description": p.what,
    "articleSection": catName,
    "url": `${BASE}/project/${p.id}/`,
    "datePublished": p.issueDate,
    "inLanguage": "zh-CN",
    "author": { "@type": "Organization", "name": p.source?.name || "搞钱项目库" }
  };
  const evidenceHtml = p.incomeEvidence
    ? `<div class="output-callout-text">${escapeHtml(p.incomeEvidence)}</div>`
    : `<div class="output-callout-text">原信源未给出可核实的收入数据，谨慎评估。</div>`;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtml(p.title)} - 搞钱项目库</title>
  <meta name="description" content="${escapeHtml(p.what)}">
  <link rel="canonical" href="${BASE}/project/${p.id}/">
  <link rel="icon" type="image/svg+xml" href="../../favicon.svg">
  <link rel="apple-touch-icon" href="../../money-icon.svg">
  <meta name="theme-color" content="#f5efe6">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(p.title)} - 搞钱项目库">
  <meta property="og:description" content="${escapeHtml(p.what)}">
  <meta property="og:url" content="${BASE}/project/${p.id}/">
  <meta property="og:image" content="${BASE}/money-icon.svg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(p.title)}">
  <meta name="twitter:description" content="${escapeHtml(p.what)}">
  <meta name="twitter:image" content="${BASE}/money-icon.svg">
  <link rel="stylesheet" href="../../style.css">
  <script type="application/ld+json">
  ${JSON.stringify(schemaObj, null, 2)}
  </script>
</head>
<body>
  <div class="bg-glow bg-glow-1"></div>
  <div class="bg-glow bg-glow-2"></div>
  <div class="app-container">
    <header class="site-header">
      <div class="header-main">
        <div class="brand-wrap">
          <a href="../../" style="display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit;">
            <div class="monimuse-avatar-wrap" title="搞钱项目库">
              <img src="../../money-icon.svg" width="44" height="44" alt="搞钱项目库" style="border-radius: 12px;">
            </div>
            <div>
              <div class="site-title">搞钱项目库</div>
              <div class="site-subtitle">真实搞钱项目拆解：赚钱逻辑、收入证据、成本与第一步</div>
            </div>
          </a>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <a href="../../" class="btn btn-outline" style="font-size: 0.84rem;">&larr; 返回项目库大盘</a>
        </div>
      </div>
    </header>
    <main>
      <div class="featured-card" style="margin-bottom: 30px;">
        <div class="featured-top-row">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span class="badge badge-cat">${escapeHtml(catName)}</span>
            <span class="badge badge-grade">Grade ${escapeHtml(p.source?.grade || 'B')}</span>
            <span class="stat-tag stat-score">🎯 匹配 ${p.matchScore}</span>
            <span class="stat-tag">📅 期次 ${escapeHtml(p.issueDate)}</span>
          </div>
        </div>
        <div class="detail-flow">
          <div class="detail-header">
            <h1 class="detail-title" style="margin-top: 10px; cursor: default;">${escapeHtml(p.title)}</h1>
            <div class="detail-valueline">${escapeHtml(p.what)}</div>
          </div>
          <div class="detail-section">
            <div class="detail-label">赚钱逻辑</div>
            <div class="detail-text">${escapeHtml(p.moneyLogic)}</div>
          </div>
          <div class="detail-section">
            <div class="output-callout">
              <div class="output-callout-label">收入证据</div>
              ${evidenceHtml}
            </div>
          </div>
          <div class="detail-meta-grid">
            <div class="detail-section">
              <div class="detail-label">启动成本</div>
              <div class="detail-text">${escapeHtml(p.cost)}</div>
            </div>
            <div class="detail-section">
              <div class="detail-label">时间投入</div>
              <div class="detail-text">${escapeHtml(p.timeCost)}</div>
            </div>
          </div>
          <div class="detail-section">
            <div class="pitfalls-callout">
              <div class="pitfalls-callout-label">风险提示</div>
              <div class="pitfalls-callout-text">${escapeHtml(p.risks)}</div>
            </div>
          </div>
          <div class="detail-section">
            <div class="detail-label">第一步行动</div>
            <div class="detail-text">${escapeHtml(p.firstStep)}</div>
          </div>
          <div class="detail-section">
            <div class="detail-label">匹配理由 · 🎯 ${p.matchScore}</div>
            <div class="detail-text">${escapeHtml(p.matchReason)}</div>
          </div>
          <div class="detail-section" style="margin-top: 6px;">
            <div class="source-verify-box">
              <div class="source-meta-left">
                <span>信源：<strong>${escapeHtml(p.source?.name)}</strong></span>
                <span>&bull;</span>
                <span>信源等级：<strong>Grade ${escapeHtml(p.source?.grade)}</strong></span>
                <span>&bull;</span>
                <span>收录期次：${escapeHtml(p.issueDate)}</span>
              </div>
              ${p.source?.url ? `
                <a href="${escapeHtml(p.source.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="padding: 6px 14px; font-size: 0.82rem;">
                  <span>打开原文</span>
                </a>` : ''}
            </div>
          </div>
          <div class="featured-footer" style="margin-top: 24px;">
            <a href="../../" class="btn btn-outline">&larr; 返回查看全部 ${totalProjects} 个搞钱项目</a>
            ${p.source?.url ? `
              <a href="${escapeHtml(p.source.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                <span>访问原文</span>
              </a>` : ''}
          </div>
        </div>
      </div>
    </main>
    <footer class="site-footer">
      <div class="footer-content">
${FOOTER_LINKS_HTML_ZH}
        <p class="footer-source">数据来源：${escapeHtml(dataZh.source)}</p>
        <p class="footer-note">所有项目、收入证据与匹配分严格以源数据为准 · 收入证据多为信源自述或转述，请自行核验</p>
      </div>
    </footer>
  </div>
</body>
</html>`;
}

function warningPageHtml(w, catName, dataZh) {
  const schemaObj = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": w.title,
    "description": w.reason,
    "url": `${BASE}/warning/${w.id}/`,
    "datePublished": w.issueDate,
    "inLanguage": "zh-CN",
    "author": { "@type": "Organization", "name": w.source?.name || "搞钱项目库" }
  };
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtml(w.title)} - 避坑提醒 - 搞钱项目库</title>
  <meta name="description" content="${escapeHtml(w.reason)}">
  <link rel="canonical" href="${BASE}/warning/${w.id}/">
  <link rel="icon" type="image/svg+xml" href="../../favicon.svg">
  <link rel="apple-touch-icon" href="../../money-icon.svg">
  <meta name="theme-color" content="#f5efe6">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(w.title)} - 避坑提醒">
  <meta property="og:description" content="${escapeHtml(w.reason)}">
  <meta property="og:url" content="${BASE}/warning/${w.id}/">
  <meta property="og:image" content="${BASE}/money-icon.svg">
  <link rel="stylesheet" href="../../style.css">
  <script type="application/ld+json">
  ${JSON.stringify(schemaObj, null, 2)}
  </script>
</head>
<body>
  <div class="bg-glow bg-glow-1"></div>
  <div class="bg-glow bg-glow-2"></div>
  <div class="app-container">
    <header class="site-header">
      <div class="header-main">
        <div class="brand-wrap">
          <a href="../../" style="display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit;">
            <div class="monimuse-avatar-wrap" title="搞钱项目库">
              <img src="../../money-icon.svg" width="44" height="44" alt="搞钱项目库" style="border-radius: 12px;">
            </div>
            <div>
              <div class="site-title">搞钱项目库</div>
              <div class="site-subtitle">真实搞钱项目拆解：赚钱逻辑、收入证据、成本与第一步</div>
            </div>
          </a>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <a href="../../" class="btn btn-outline" style="font-size: 0.84rem;">&larr; 返回项目库大盘</a>
        </div>
      </div>
    </header>
    <main>
      <div class="featured-card" style="margin-bottom: 30px;">
        <div class="featured-top-row">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span class="badge badge-warning">⚠️ 避坑</span>
            ${catName ? `<span class="badge badge-cat">${escapeHtml(catName)}</span>` : ''}
            <span class="stat-tag">📅 期次 ${escapeHtml(w.issueDate)}</span>
          </div>
        </div>
        <div class="detail-flow">
          <div class="detail-header">
            <h1 class="detail-title" style="margin-top: 10px; cursor: default;">${escapeHtml(w.title)}</h1>
          </div>
          <div class="detail-section">
            <div class="pitfalls-callout">
              <div class="pitfalls-callout-label">为什么是坑</div>
              <div class="pitfalls-callout-text">${escapeHtml(w.reason)}</div>
            </div>
          </div>
          <div class="detail-section" style="margin-top: 6px;">
            <div class="source-verify-box">
              <div class="source-meta-left">
                <span>信源：<strong>${escapeHtml(w.source?.name)}</strong></span>
                <span>&bull;</span>
                <span>收录期次：${escapeHtml(w.issueDate)}</span>
              </div>
              ${w.source?.url ? `
                <a href="${escapeHtml(w.source.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="padding: 6px 14px; font-size: 0.82rem;">
                  <span>打开原文</span>
                </a>` : ''}
            </div>
          </div>
          <div class="featured-footer" style="margin-top: 24px;">
            <a href="../../" class="btn btn-outline">&larr; 返回项目库大盘</a>
          </div>
        </div>
      </div>
    </main>
    <footer class="site-footer">
      <div class="footer-content">
${FOOTER_LINKS_HTML_ZH}
        <p class="footer-source">数据来源：${escapeHtml(dataZh.source)}</p>
        <p class="footer-note">所有项目、收入证据与匹配分严格以源数据为准 · 收入证据多为信源自述或转述，请自行核验</p>
      </div>
    </footer>
  </div>
</body>
</html>`;
}

function staticProjectCards(data, catMap, isEn) {
  return data.projects.map(p => `
    <article class="case-card" data-id="${p.id}">
      <div>
        <div class="card-header-row">
          <div class="card-badges">
            <span class="badge badge-cat">${escapeHtml(catMap[p.categoryId] || '')}</span>
            <span class="badge badge-grade">Grade ${escapeHtml(p.source?.grade || '')}</span>
          </div>
        </div>
        <h3 class="card-title">${escapeHtml(p.title)}</h3>
        <p class="card-valueline">${escapeHtml(p.what)}</p>
        <div class="card-stats-row">
          <span class="stat-tag stat-score">🎯 ${p.matchScore}</span>
          <span class="stat-tag">📅 ${escapeHtml(p.issueDate)}</span>
        </div>
      </div>
      <div class="card-footer">
        <div class="card-source-info"><span>${escapeHtml(p.source?.name || '')}</span></div>
        <a class="card-detail-action" href="${isEn ? '../' : './'}project/${p.id}/">${isEn ? 'Details &rarr;' : '详情 &rarr;'}</a>
      </div>
    </article>`).join('\n');
}

function staticWarningCards(data, catMap, isEn) {
  return data.warnings.map(w => `
    <article class="warning-card" data-id="${w.id}">
      <div class="warning-card-top">
        <span class="badge badge-warning">${isEn ? '⚠️ SCAM WARNING' : '⚠️ 避坑'}</span>
        ${(w.categoryId !== null && w.categoryId !== undefined && catMap[w.categoryId]) ? `<span class="badge badge-cat">${escapeHtml(catMap[w.categoryId])}</span>` : ''}
        <span class="stat-tag">📅 ${escapeHtml(w.issueDate)}</span>
      </div>
      <h3 class="warning-title">${escapeHtml(w.title)}</h3>
      <p class="warning-reason">${escapeHtml(w.reason)}</p>
      <div class="warning-footer">
        <span class="card-source-info">${escapeHtml(w.source?.name || '')}</span>
        <a class="card-detail-action" href="${isEn ? '../' : './'}warning/${w.id}/">${isEn ? 'Details &rarr;' : '详情 &rarr;'}</a>
      </div>
    </article>`).join('\n');
}

function runSync() {
  console.log('🚀 开始执行站点 SEO 与静态层全量同步...');
  const rootDir = __dirname;
  const dataZhPath = path.join(rootDir, 'data.json');
  const dataEnPath = path.join(rootDir, 'data-en.json');
  if (!fs.existsSync(dataZhPath) || !fs.existsSync(dataEnPath)) {
    console.error('❌ 错误：未找到 data.json 或 data-en.json！');
    process.exit(1);
  }
  const dataZh = JSON.parse(fs.readFileSync(dataZhPath, 'utf8'));
  const dataEn = JSON.parse(fs.readFileSync(dataEnPath, 'utf8'));

  const validation = validateData(dataZh, dataEn);
  validation.warnings.forEach(w => console.warn(`⚠️ 校验提示: ${w}`));
  if (!validation.ok) {
    console.error('❌ 数据门禁校验失败，同步中止：');
    validation.errors.forEach(e => console.error(`   - ${e}`));
    process.exit(1);
  }
  console.log('✅ 数据完整性与双语对齐门禁校验 100% 通过！');

  const totalProjects = dataZh.projects.length;
  const totalWarnings = dataZh.warnings.length;
  const today = new Date().toISOString().split('T')[0];
  const latestDate = dataZh.issues?.[dataZh.issues.length - 1]?.date || today;
  console.log(`📦 项目 ${totalProjects} 条，避坑 ${totalWarnings} 条，最新期次: ${latestDate}`);

  fs.writeFileSync(path.join(rootDir, 'data-fallback.js'), 'window.FALLBACK_DATA = ' + JSON.stringify(dataZh, null, 2) + ';\n');
  fs.writeFileSync(path.join(rootDir, 'data-en-fallback.js'), 'window.FALLBACK_DATA_EN = ' + JSON.stringify(dataEn, null, 2) + ';\n');
  console.log('✅ fallback 文件同步完毕');

  const catMapZh = {}; dataZh.categories.forEach(c => { catMapZh[c.id] = c.name; });
  const catMapEn = {}; dataEn.categories.forEach(c => { catMapEn[c.id] = c.name; });

  const projBase = path.join(rootDir, 'project');
  if (!fs.existsSync(projBase)) fs.mkdirSync(projBase, { recursive: true });
  dataZh.projects.forEach(p => {
    const dir = path.join(projBase, String(p.id));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), projectPageHtml(p, catMapZh[p.categoryId] || '', totalProjects, dataZh));
  });
  console.log(`✅ ${totalProjects} 个项目详情页 (/project/<id>/) 生成完毕`);

  const warnBase = path.join(rootDir, 'warning');
  if (!fs.existsSync(warnBase)) fs.mkdirSync(warnBase, { recursive: true });
  dataZh.warnings.forEach(w => {
    const dir = path.join(warnBase, String(w.id));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const catName = (w.categoryId !== null && w.categoryId !== undefined) ? (catMapZh[w.categoryId] || '') : '';
    fs.writeFileSync(path.join(dir, 'index.html'), warningPageHtml(w, catName, dataZh));
  });
  console.log(`✅ ${totalWarnings} 个避坑详情页 (/warning/<id>/) 生成完毕`);

  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE}/en/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;
  dataZh.projects.forEach(p => {
    sitemapXml += `  <url>
    <loc>${BASE}/project/${p.id}/</loc>
    <lastmod>${p.issueDate || today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>\n`;
  });
  dataZh.warnings.forEach(w => {
    sitemapXml += `  <url>
    <loc>${BASE}/warning/${w.id}/</loc>
    <lastmod>${w.issueDate || today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
  });
  dataZh.categories.forEach(cat => {
    sitemapXml += `  <url>
    <loc>${BASE}/?cat=${cat.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  });
  sitemapXml += `</urlset>\n`;
  fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), sitemapXml);
  console.log('✅ sitemap.xml 全量重建完毕');

  // ---- index.html (zh) ----
  const schemaListZh = dataZh.projects.map((p, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "item": {
      "@type": "Article",
      "headline": p.title,
      "description": p.what,
      "articleSection": catMapZh[p.categoryId] || '',
      "url": `${BASE}/project/${p.id}/`,
      "datePublished": p.issueDate,
      "inLanguage": "zh-CN",
      "author": { "@type": "Organization", "name": p.source?.name }
    }
  }));
  const fullSchemaZh = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASE}/#website`,
        "url": `${BASE}/`,
        "name": dataZh.site,
        "description": dataZh.subject,
        "inLanguage": "zh-CN"
      },
      {
        "@type": "CollectionPage",
        "@id": `${BASE}/#collection`,
        "url": `${BASE}/`,
        "name": `${dataZh.site} - 真实搞钱项目拆解与避坑指南`,
        "description": dataZh.subject,
        "mainEntity": { "@type": "ItemList", "itemListElement": schemaListZh }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "搞钱项目库收录什么样的项目？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "覆盖 AI 服务接单、AI 工具与应用、数字产品、独立开发、小游戏、工具站与内容站、自媒体、电商、二手交易、线下生意等 31 个分类的真实项目拆解，每条包含赚钱逻辑、收入证据、启动成本、时间投入、风险与第一步行动。"
            }
          },
          {
            "@type": "Question",
            "name": "项目里的收入证据可信吗？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "每条项目都标注信源等级（A/B/C）与原文链接；收入数字多为信源自述或媒体转述，本站逐条保留原文口径与出处，请点击原文自行核验后再行动。"
            }
          },
          {
            "@type": "Question",
            "name": "避坑区是什么？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "避坑区汇总已被监管机构处罚或被多方证实的搞钱骗局套路，例如先交高额系统费、承诺全自动赚钱、兼职先交费等；命中“先交钱、保收益、全自动”话术的项目一律绕行。"
            }
          }
        ]
      }
    ]
  };

  let indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  indexHtml = indexHtml.replace(/收录 \d+ 个真实搞钱项目/g, `收录 ${totalProjects} 个真实搞钱项目`);
  indexHtml = indexHtml.replace(/展示 \d+ 个项目/g, `展示 ${totalProjects} 个项目`);
  indexHtml = indexHtml.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n  ${JSON.stringify(fullSchemaZh, null, 2)}\n  </script>`);
  indexHtml = replaceElementInner(indexHtml, 'casesGrid', '\n' + staticProjectCards(dataZh, catMapZh, false) + '\n      ');
  indexHtml = replaceElementInner(indexHtml, 'warningsGrid', '\n' + staticWarningCards(dataZh, catMapZh, false) + '\n      ');
  indexHtml = injectGA(indexHtml);
  indexHtml = injectFooterLinks(indexHtml, false);
  fs.writeFileSync(path.join(rootDir, 'index.html'), indexHtml);
  console.log('✅ index.html 更新完毕');

  // ---- en/index.html ----
  const schemaListEn = dataEn.projects.map((p, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "item": {
      "@type": "Article",
      "headline": p.title,
      "description": p.what,
      "articleSection": catMapEn[p.categoryId] || '',
      "url": `${BASE}/project/${p.id}/`,
      "datePublished": p.issueDate,
      "inLanguage": "en",
      "author": { "@type": "Organization", "name": p.source?.name }
    }
  }));
  const fullSchemaEn = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASE}/en/#website`,
        "url": `${BASE}/en/`,
        "name": dataEn.site,
        "description": dataEn.subject,
        "inLanguage": "en"
      },
      {
        "@type": "CollectionPage",
        "@id": `${BASE}/en/#collection`,
        "url": `${BASE}/en/`,
        "name": `${dataEn.site} - Real Money-Making Projects & Scam Warnings`,
        "description": dataEn.subject,
        "mainEntity": { "@type": "ItemList", "itemListElement": schemaListEn }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What kinds of projects does the Money Project Library collect?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Real money-making projects across 31 categories — AI services, AI tools, digital products, indie development, mini games, tool and content sites, self-media, e-commerce, second-hand trading and offline businesses — each deconstructed with money logic, income evidence, startup cost, time cost, risks and a first step."
            }
          },
          {
            "@type": "Question",
            "name": "Can I trust the income evidence?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Every project carries a source grade (A/B/C) and a link to the original report. Income figures are mostly self-reported by founders or relayed by media; we keep the original wording and source so you can verify before acting."
            }
          },
          {
            "@type": "Question",
            "name": "What is the Scam Warnings section?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "It collects money-making scams confirmed by regulators or multiple reports — high upfront system fees, guaranteed fully-automatic income, pay-to-work job scams. Walk away from any pitch built on pay-first, guaranteed returns, or fully automatic claims."
            }
          }
        ]
      }
    ]
  };

  let enIndexHtml = fs.readFileSync(path.join(rootDir, 'en', 'index.html'), 'utf8');
  enIndexHtml = enIndexHtml.replace(/Explore \d+ verified/g, `Explore ${totalProjects} verified`);
  enIndexHtml = enIndexHtml.replace(/Showing \d+ (cases|projects)/g, `Showing ${totalProjects} projects`);
  enIndexHtml = enIndexHtml.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n  ${JSON.stringify(fullSchemaEn, null, 2)}\n  </script>`);
  enIndexHtml = replaceElementInner(enIndexHtml, 'casesGrid', '\n' + staticProjectCards(dataEn, catMapEn, true) + '\n      ');
  enIndexHtml = replaceElementInner(enIndexHtml, 'warningsGrid', '\n' + staticWarningCards(dataEn, catMapEn, true) + '\n      ');
  enIndexHtml = injectGA(enIndexHtml);
  enIndexHtml = injectFooterLinks(enIndexHtml, true);
  fs.writeFileSync(path.join(rootDir, 'en', 'index.html'), enIndexHtml);
  console.log('✅ en/index.html 更新完毕');

  console.log('🎉 同步全部完成！');
}

runSync();
