// 搞钱项目库 - 双语 (CH / EN) 交互核心脚本
(function () {
  'use strict';

  // 国际化文案字典
  const I18N = {
    zh: {
      siteTitle: '搞钱项目库',
      siteSubject: '真实搞钱项目拆解：赚钱逻辑、收入证据、成本与第一步',
      statTotalCasesLabel: '搞钱项目',
      statCategoriesLabel: '分类覆盖',
      statWarningsLabel: '避坑提醒',
      statLatestDateLabel: '最新期次',
      featuredBadge: '🌟 本期头条',
      trendingTitle: '高匹配 Top 5',
      trendingHint: '按与本站读者画像的匹配度排序',
      searchPlaceholder: '搜索项目、赚钱逻辑、收入证据或出处...',
      sortMatch: '🎯 按匹配度从高到低',
      sortNewest: '🕒 按最新期次',
      sortOldest: '📚 按期次从早到晚',
      favBtn: '只看想做的',
      allCategories: '全部',
      resultsCount: (count, total) => `展示 ${count} 个项目 (共 ${total} 个)`,
      pagePrev: '上一页',
      pageNext: '下一页',
      pageOf: (cur, total, count) => `第 ${cur}/${total} 页（共 ${count} 条）`,
      resetFilters: '重置所有筛选',
      emptyTitle: '未找到匹配的项目',
      emptyDesc: '尝试更换搜索词、切换分类或取消“只看想做的”',
      emptyReset: '恢复显示全部项目',
      sourceLink: '原文',
      viewDetails: '详情 &rarr;',
      viewPlan: '看拆解 &rarr;',
      modalWhat: '做什么',
      modalMoneyLogic: '赚钱逻辑',
      modalEvidence: '收入证据',
      modalEvidenceEmpty: '原信源未给出可核实的收入数据，谨慎评估。',
      modalCost: '启动成本',
      modalTimeCost: '时间投入',
      modalRisks: '风险提示',
      modalFirstStep: '第一步行动',
      modalMatch: '匹配理由',
      modalWarningReason: '为什么是坑',
      modalSource: '原始信源核对',
      modalAuthor: '信源',
      modalGrade: '信源等级',
      modalDate: '收录期次',
      modalDedicated: '独立专属落地页 ↗',
      modalVisitSource: '访问原文',
      modalClose: '关闭',
      modalGuaranteed: '所有字段提取自源数据',
      toastFavAdded: '已加入「想做的」',
      toastFavRemoved: '已移出「想做的」',
      footerSourcePrefix: '数据来源：',
      footerNote: '所有项目、收入证据与匹配分严格以源数据为准 · 收入证据多为信源自述或转述，请自行核验 · 搞钱项目整理',
      warningsTitle: '避坑区',
      warningsHint: '先交钱、保收益、全自动——命中这些话术的项目一律绕行',
      warningBadge: '⚠️ 避坑'
    },
    en: {
      siteTitle: 'Money Project Library',
      siteSubject: 'Real money-making projects, deconstructed: how they make money, income evidence, costs and first steps',
      statTotalCasesLabel: 'Projects',
      statCategoriesLabel: 'Categories',
      statWarningsLabel: 'Scam Warnings',
      statLatestDateLabel: 'Latest Issue',
      featuredBadge: '🌟 FEATURED',
      trendingTitle: 'Top 5 Best Fit',
      trendingHint: 'Ranked by fit score for our reader profile',
      searchPlaceholder: 'Search projects, money logic, income evidence, sources...',
      sortMatch: '🎯 Highest Fit Score',
      sortNewest: '🕒 Latest Issue',
      sortOldest: '📚 Earliest Issue',
      favBtn: 'Want to try',
      allCategories: 'All',
      resultsCount: (count, total) => `Showing ${count} of ${total} projects`,
      pagePrev: 'Previous',
      pageNext: 'Next',
      pageOf: (cur, total, count) => `Page ${cur} of ${total} (${count} projects)`,
      resetFilters: 'Reset all filters',
      emptyTitle: 'No matching projects found',
      emptyDesc: 'Try adjusting your search, selecting another category, or clearing the saved filter',
      emptyReset: 'Show all projects',
      sourceLink: 'Source',
      viewDetails: 'Details &rarr;',
      viewPlan: 'Breakdown &rarr;',
      modalWhat: 'What It Is',
      modalMoneyLogic: 'How It Makes Money',
      modalEvidence: 'Income Evidence',
      modalEvidenceEmpty: 'The source gives no verifiable income figures — assess with extra care.',
      modalCost: 'Startup Cost',
      modalTimeCost: 'Time Cost',
      modalRisks: 'Risks',
      modalFirstStep: 'First Step',
      modalMatch: 'Why It Fits',
      modalWarningReason: 'Why It Is a Scam',
      modalSource: 'Source Verification',
      modalAuthor: 'Source',
      modalGrade: 'Source Grade',
      modalDate: 'Issue Date',
      modalDedicated: 'Dedicated page ↗',
      modalVisitSource: 'Visit source',
      modalClose: 'Close',
      modalGuaranteed: 'All fields extracted from source data',
      toastFavAdded: 'Added to “Want to try”',
      toastFavRemoved: 'Removed from “Want to try”',
      footerSourcePrefix: 'Data source: ',
      footerNote: 'All projects, income evidence and fit scores strictly from source data · Income claims are mostly self-reported — verify before you act · Money Project Library',
      warningsTitle: 'Scam Warnings',
      warningsHint: 'Pay first, guaranteed returns, fully automatic — walk away from any pitch with these lines',
      warningBadge: '⚠️ SCAM WARNING'
    }
  };

  // 状态变量
  let state = {
    lang: 'zh',
    dataZh: null,
    dataEn: null,
    data: null,
    currentCategory: 'all',
    searchKeyword: '',
    currentPage: 1,
    pageSize: 60,
    currentSort: 'match',
    favoritesOnly: false,
    favorites: new Set(),
    activeModalCaseId: null,
    activeModalWarningId: null
  };

  const STORAGE_KEY_FAV = 'money_project_favorites_v1';
  const STORAGE_KEY_LANG = 'money_site_lang_v1';

  // DOM 节点引用
  const dom = {
    siteTitle: document.getElementById('siteTitle'),
    siteSubject: document.getElementById('siteSubject'),
    statTotalCases: document.getElementById('statTotalCases'),
    statTotalCasesLabel: document.getElementById('statTotalCasesLabel'),
    statCategories: document.getElementById('statCategories'),
    statCategoriesLabel: document.getElementById('statCategoriesLabel'),
    statLatestDate: document.getElementById('statLatestDate'),
    statLatestDateLabel: document.getElementById('statLatestDateLabel'),
    statWarnings: document.getElementById('statWarnings'),
    statWarningsLabel: document.getElementById('statWarningsLabel'),
    langZhBtn: document.getElementById('langZhBtn'),
    langEnBtn: document.getElementById('langEnBtn'),
    featuredSection: document.getElementById('featuredSection'),
    trendingGrid: document.getElementById('trendingGrid'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    sortSelect: document.getElementById('sortSelect'),
    favFilterBtn: document.getElementById('favFilterBtn'),
    favCountBadge: document.getElementById('favCountBadge'),
    categoryTabs: document.getElementById('categoryTabs'),
    resultsCount: document.getElementById('resultsCount'),
    resetFilterLink: document.getElementById('resetFilterLink'),
    casesGrid: document.getElementById('casesGrid'),
    warningsGrid: document.getElementById('warningsGrid'),
    paginationWrap: document.getElementById('paginationWrap'),
    emptyState: document.getElementById('emptyState'),
    emptyResetBtn: document.getElementById('emptyResetBtn'),
    footerSource: document.getElementById('footerSource'),
    // Modal
    caseModal: document.getElementById('caseModal'),
    modalMeta: document.getElementById('modalMeta'),
    modalFavBtn: document.getElementById('modalFavBtn'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalBody: document.getElementById('modalBody'),
    modalFooter: document.getElementById('modalFooter'),
    toast: document.getElementById('toast')
  };

  // 初始化入口
  async function init() {
    loadLanguagePreference();
    loadFavoritesFromStorage();
    bindGlobalEvents();
    await loadData();
  }

  // 读取语言偏好设置
  function loadLanguagePreference() {
    try {
      // 位于 /en/ 独立静态英文路由下，默认锁定为英文
      if (window.location.pathname.includes('/en/')) {
        state.lang = 'en';
        return;
      }

      // 优先从 URL 参数中获取 ?lang=
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang === 'en' || urlLang === 'zh') {
        state.lang = urlLang;
        localStorage.setItem(STORAGE_KEY_LANG, urlLang);
        return;
      }

      // 其次从 localStorage 获取
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved === 'en' || saved === 'zh') {
        state.lang = saved;
        return;
      }

      // 最后检测浏览器语言偏好
      if (navigator.language && !navigator.language.toLowerCase().startsWith('zh')) {
        state.lang = 'en';
      } else {
        state.lang = 'zh';
      }
    } catch (e) {
      state.lang = 'zh';
    }
  }

  // 加载数据 (中英双语并行加载)
  async function loadData() {
    const basePath = window.location.pathname.includes('/en/') ? '../' : './';
    try {
      const [resZh, resEn] = await Promise.all([
        fetch(basePath + 'data.json').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(basePath + 'data-en.json').then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      state.dataZh = resZh || window.FALLBACK_DATA;
      state.dataEn = resEn || window.FALLBACK_DATA_EN || state.dataZh;
    } catch (err) {
      console.warn('Fetch data failed, using fallback data...', err);
      state.dataZh = window.FALLBACK_DATA;
      state.dataEn = window.FALLBACK_DATA_EN || window.FALLBACK_DATA;
    }

    applyCurrentLanguageData();
    renderAll();
  }

  // 根据当前 state.lang 激活对应数据包与文档属性
  function applyCurrentLanguageData() {
    state.data = state.lang === 'en' ? (state.dataEn || state.dataZh) : state.dataZh;

    // 更新 html 属性
    document.documentElement.lang = state.lang === 'en' ? 'en' : 'zh-CN';

    // 更新切换器按钮状态
    if (dom.langZhBtn && dom.langEnBtn) {
      if (state.lang === 'zh') {
        dom.langZhBtn.classList.add('active');
        dom.langEnBtn.classList.remove('active');
      } else {
        dom.langZhBtn.classList.remove('active');
        dom.langEnBtn.classList.add('active');
      }
    }

    // 更新静态界面字典
    updateStaticTexts();
  }

  // 切换语言
  function setLanguage(newLang) {
    if (newLang === state.lang) return;
    state.lang = newLang;
    try {
      localStorage.setItem(STORAGE_KEY_LANG, newLang);
    } catch (e) {}

    // 如果处于静态部署环境，通过标准独立路由切换，实现 Google 最佳双语多 URL 索引体验
    if (window.location.protocol.startsWith('http')) {
      if (newLang === 'en' && !window.location.pathname.includes('/en/')) {
        window.location.href = './en/' + (window.location.search || '');
        return;
      }
      if (newLang === 'zh' && window.location.pathname.includes('/en/')) {
        window.location.href = '../' + (window.location.search || '');
        return;
      }
    }

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', newLang);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}

    applyCurrentLanguageData();
    renderAll();

    // 如果弹窗处于打开状态，即时重新渲染该弹窗为目标语言
    if (state.activeModalCaseId !== null) {
      openCaseModal(state.activeModalCaseId);
    } else if (state.activeModalWarningId !== null) {
      openWarningModal(state.activeModalWarningId);
    }
  }

  // 更新界面的静态 UI 文本
  function updateStaticTexts() {
    const t = I18N[state.lang];
    if (dom.siteTitle && state.data) dom.siteTitle.textContent = state.data.site;
    if (dom.siteSubject && state.data) dom.siteSubject.textContent = state.data.subject;

    if (dom.statTotalCasesLabel) dom.statTotalCasesLabel.textContent = t.statTotalCasesLabel;
    if (dom.statCategoriesLabel) dom.statCategoriesLabel.textContent = t.statCategoriesLabel;
    if (dom.statWarningsLabel) dom.statWarningsLabel.textContent = t.statWarningsLabel;
    if (dom.statLatestDateLabel) dom.statLatestDateLabel.textContent = t.statLatestDateLabel;

    if (dom.searchInput) dom.searchInput.placeholder = t.searchPlaceholder;

    if (dom.sortSelect) {
      const opts = dom.sortSelect.options;
      if (opts.length >= 3) {
        opts[0].text = t.sortMatch;
        opts[1].text = t.sortNewest;
        opts[2].text = t.sortOldest;
      }
    }

    if (dom.favFilterBtn) {
      const span = dom.favFilterBtn.querySelector('span:not(.fav-count-badge)');
      if (span) span.textContent = t.favBtn;
    }

    const trendingHeaderTitle = document.querySelector('.section-trending .section-title');
    if (trendingHeaderTitle) trendingHeaderTitle.textContent = t.trendingTitle;
    const trendingHint = document.querySelector('.section-trending .section-hint');
    if (trendingHint) trendingHint.textContent = t.trendingHint;

    const warningsHeaderTitle = document.querySelector('.section-warnings .section-title');
    if (warningsHeaderTitle) warningsHeaderTitle.textContent = t.warningsTitle;
    const warningsHint = document.querySelector('.section-warnings .section-hint');
    if (warningsHint) warningsHint.textContent = t.warningsHint;

    if (dom.resetFilterLink) dom.resetFilterLink.textContent = t.resetFilters;

    const emptyTitleEl = document.querySelector('.empty-title');
    if (emptyTitleEl) emptyTitleEl.textContent = t.emptyTitle;
    const emptyDescEl = document.querySelector('.empty-desc');
    if (emptyDescEl) emptyDescEl.textContent = t.emptyDesc;
    if (dom.emptyResetBtn) dom.emptyResetBtn.textContent = t.emptyReset;

    if (dom.footerSource && state.data) {
      dom.footerSource.textContent = t.footerSourcePrefix + state.data.source;
    }
    const footerNoteEl = document.querySelector('.footer-note');
    if (footerNoteEl) footerNoteEl.textContent = t.footerNote;

    const footerLinksContainer = document.querySelector('.footer-links');
    if (footerLinksContainer) {
      if (state.lang === 'en') {
        footerLinksContainer.innerHTML = `
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
        `;
      } else {
        footerLinksContainer.innerHTML = `
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
        `;
      }
    }
  }

  // 加载收藏记录
  function loadFavoritesFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FAV);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          state.favorites = new Set(arr);
        }
      }
    } catch (e) {
      state.favorites = new Set();
    }
    updateFavBadges();
  }

  // 保存收藏记录
  function saveFavoritesToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_FAV, JSON.stringify(Array.from(state.favorites)));
    } catch (e) {}
    updateFavBadges();
  }

  // 切换案例收藏
  function toggleFavorite(id, e) {
    if (e) e.stopPropagation();
    const numId = Number(id);
    const t = I18N[state.lang];
    let isFav = false;
    if (state.favorites.has(numId)) {
      state.favorites.delete(numId);
      isFav = false;
      showToast(t.toastFavRemoved);
    } else {
      state.favorites.add(numId);
      isFav = true;
      showToast(t.toastFavAdded);
    }
    saveFavoritesToStorage();

    updateCardFavState(numId, isFav);
    if (state.activeModalCaseId === numId) {
      updateModalFavState(isFav);
    }

    if (state.favoritesOnly) {
      renderCasesGrid();
    }
  }

  // 更新徽章数字
  function updateFavBadges() {
    if (dom.favCountBadge) {
      dom.favCountBadge.textContent = state.favorites.size;
    }
  }

  // 更新卡片收藏状态
  function updateCardFavState(id, isFav) {
    const btns = document.querySelectorAll(`[data-fav-case-id="${id}"]`);
    btns.forEach(btn => {
      if (isFav) {
        btn.classList.add('active');
        btn.setAttribute('title', state.lang === 'en' ? 'Saved (click to remove)' : '已加入想做的，点击取消');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('title', state.lang === 'en' ? 'Save project' : '加入想做的');
      }
    });
  }

  // 更新弹窗收藏状态
  function updateModalFavState(isFav) {
    if (!dom.modalFavBtn) return;
    if (isFav) {
      dom.modalFavBtn.classList.add('active');
      dom.modalFavBtn.setAttribute('title', state.lang === 'en' ? 'Saved (click to remove)' : '已加入想做的，点击取消');
    } else {
      dom.modalFavBtn.classList.remove('active');
      dom.modalFavBtn.setAttribute('title', state.lang === 'en' ? 'Save project' : '加入想做的');
    }
  }

  // 全量渲染
  function renderAll() {
    if (!state.data) return;

    renderHeaderAndStats();
    renderFeatured();
    renderTrending();
    renderCategoryTabs();
    renderCasesGrid();
    renderWarnings();
    checkInitialUrlDeepLink();
  }

  // 检查初始 URL 是否有指定某个项目/避坑
  function checkInitialUrlDeepLink() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let projectId = urlParams.get('project');
      let warningId = urlParams.get('warning');
      if (!projectId && !warningId && window.location.hash) {
        const m1 = window.location.hash.match(/project-(\d+)/);
        if (m1) projectId = m1[1];
        const m2 = window.location.hash.match(/warning-(\d+)/);
        if (m2) warningId = m2[1];
      }
      if (projectId) {
        const targetId = Number(projectId);
        const exists = (state.data?.projects || []).some(p => p.id === targetId);
        if (exists && state.activeModalCaseId !== targetId) {
          setTimeout(() => openCaseModal(targetId), 100);
        }
      } else if (warningId) {
        const targetId = Number(warningId);
        const exists = (state.data?.warnings || []).some(w => w.id === targetId);
        if (exists && state.activeModalWarningId !== targetId) {
          setTimeout(() => openWarningModal(targetId), 100);
        }
      }
    } catch (e) {}
  }

  // 1. 渲染顶部与统计
  function renderHeaderAndStats() {
    const { site, subject, projects, warnings, categories, issues } = state.data;
    if (site && dom.siteTitle) dom.siteTitle.textContent = site;
    if (subject && dom.siteSubject) dom.siteSubject.textContent = subject;

    if (dom.statTotalCases) dom.statTotalCases.textContent = projects ? projects.length : 0;
    if (dom.statCategories) dom.statCategories.textContent = categories ? categories.length : 0;
    if (dom.statWarnings) dom.statWarnings.textContent = warnings ? warnings.length : 0;

    let latestDate = '--';
    if (issues && issues.length > 0) {
      latestDate = issues[issues.length - 1].date;
    } else if (projects && projects.length > 0) {
      latestDate = projects[projects.length - 1].issueDate || '--';
    }
    if (dom.statLatestDate) dom.statLatestDate.textContent = latestDate;
  }

  // 2. 渲染本期头条 (Featured)
  function renderFeatured() {
    const projects = state.data.projects || [];
    const featured = projects.find(p => p.featured) || projects[0];
    const t = I18N[state.lang];

    if (!featured) {
      dom.featuredSection.innerHTML = '';
      return;
    }

    const catName = getCategoryName(featured.categoryId);
    const gradeClass = getGradeClass(featured.source?.grade);
    const isFav = state.favorites.has(featured.id);

    dom.featuredSection.innerHTML = `
      <div class="featured-card">
        <div class="featured-top-row">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span class="featured-badge">${t.featuredBadge}</span>
            <span class="badge badge-cat">${escapeHtml(catName)}</span>
            <span class="badge badge-grade ${gradeClass}">Grade ${escapeHtml(featured.source?.grade || '')}</span>
          </div>
          <button class="card-fav-btn ${isFav ? 'active' : ''}" data-fav-case-id="${featured.id}" title="${isFav ? (state.lang === 'en' ? 'Saved' : '已加入想做的') : (state.lang === 'en' ? 'Save' : '加入想做的')}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>

        <h2 class="featured-title" data-open-modal="${featured.id}">${escapeHtml(featured.title)}</h2>

        <p class="featured-valueline">${escapeHtml(featured.what)}</p>

        <div class="featured-meta-bar">
          <span class="stat-tag stat-score">🎯 ${featured.matchScore}</span>
          <span style="color: var(--text-dim);">&bull;</span>
          <span class="stat-tag">💰 ${escapeHtml(featured.cost)}</span>
          <span style="color: var(--text-dim);">&bull;</span>
          <span class="stat-tag">📅 ${escapeHtml(featured.issueDate)}</span>
        </div>

        <div class="featured-footer">
          <div class="featured-source-wrap">
            <span><strong>${escapeHtml(featured.source?.name || '')}</strong></span>
            ${featured.source?.url ? `
              <a href="${escapeHtml(featured.source.url)}" target="_blank" rel="noopener noreferrer" class="source-link-btn" title="Original source">
                <span>${t.sourceLink}</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            ` : ''}
          </div>

          <div class="featured-actions">
            <button class="btn btn-primary" data-open-modal="${featured.id}">
              <span>${t.viewPlan}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    const favBtn = dom.featuredSection.querySelector(`[data-fav-case-id="${featured.id}"]`);
    if (favBtn) {
      favBtn.addEventListener('click', (e) => toggleFavorite(featured.id, e));
    }

    const openBtns = dom.featuredSection.querySelectorAll(`[data-open-modal="${featured.id}"]`);
    openBtns.forEach(btn => {
      btn.addEventListener('click', () => openCaseModal(featured.id));
    });
  }

  // 3. 渲染高匹配榜 Top 5
  function renderTrending() {
    const projects = state.data.projects || [];
    const sorted = [...projects].sort((a, b) =>
      (b.matchScore - a.matchScore) ||
      (b.issueDate || '').localeCompare(a.issueDate || '') ||
      (b.id - a.id));
    const top5 = sorted.slice(0, 5);

    dom.trendingGrid.innerHTML = top5.map((p, index) => {
      const rank = index + 1;
      const catName = getCategoryName(p.categoryId);
      return `
        <div class="trending-card" data-open-modal="${p.id}" tabindex="0" role="button" aria-label="${escapeHtml(p.title)}">
          <div>
            <div class="trending-card-top">
              <span class="rank-badge rank-${rank}">${rank < 10 ? '0' + rank : rank}</span>
              <span class="trending-heat">🎯 ${p.matchScore}</span>
            </div>
            <div class="trending-title" title="${escapeHtml(p.title)}">${escapeHtml(p.title)}</div>
          </div>
          <div class="trending-meta">
            <span>${escapeHtml(catName)}</span>
            <span>Grade ${escapeHtml(p.source?.grade || '')}</span>
          </div>
        </div>
      `;
    }).join('');

    const cards = dom.trendingGrid.querySelectorAll('.trending-card');
    cards.forEach(card => {
      const id = Number(card.getAttribute('data-open-modal'));
      card.addEventListener('click', () => openCaseModal(id));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCaseModal(id);
        }
      });
    });
  }

  // 4. 渲染分类标签条（按分组）
  function renderCategoryTabs() {
    const { categories, projects } = state.data;
    if (!categories) return;
    const t = I18N[state.lang];

    const countMap = {};
    (projects || []).forEach(p => {
      countMap[p.categoryId] = (countMap[p.categoryId] || 0) + 1;
    });

    const totalCount = projects ? projects.length : 0;

    let html = `
      <button class="cat-tab-btn ${state.currentCategory === 'all' ? 'active' : ''}" data-cat="all">
        <span>${t.allCategories}</span>
        <span class="cat-count">${totalCount}</span>
      </button>
    `;

    const groups = [];
    categories.forEach(cat => { if (!groups.includes(cat.group)) groups.push(cat.group); });

    groups.forEach(g => {
      html += `<div class="cat-group-label">${escapeHtml(g)}</div>`;
      categories.filter(cat => cat.group === g).forEach(cat => {
        const count = countMap[cat.id] || 0;
        const isActive = String(state.currentCategory) === String(cat.id);
        html += `
          <button class="cat-tab-btn ${isActive ? 'active' : ''}" data-cat="${cat.id}">
            <span>${escapeHtml(cat.name)}</span>
            <span class="cat-count">${count}</span>
          </button>
        `;
      });
    });

    dom.categoryTabs.innerHTML = html;

    const tabBtns = dom.categoryTabs.querySelectorAll('.cat-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat');
        setCategory(cat);
      });
    });
  }

  // 切换分类
  function setCategory(catId) {
    state.currentCategory = catId;
    state.currentPage = 1;
    const tabBtns = dom.categoryTabs.querySelectorAll('.cat-tab-btn');
    tabBtns.forEach(btn => {
      if (btn.getAttribute('data-cat') === catId) {
        btn.classList.add('active');
        btn.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
      } else {
        btn.classList.remove('active');
      }
    });
    renderCasesGrid();
  }

  // 5. 渲染项目网格
  function renderCasesGrid() {
    const projects = state.data.projects || [];
    const keyword = state.searchKeyword.trim().toLowerCase();
    const t = I18N[state.lang];

    let filtered = projects.filter(p => {
      if (state.currentCategory !== 'all' && String(p.categoryId) !== String(state.currentCategory)) {
        return false;
      }
      if (state.favoritesOnly && !state.favorites.has(p.id)) {
        return false;
      }
      if (keyword) {
        const hay = [
          p.title, p.what, p.moneyLogic, p.incomeEvidence, p.risks, p.firstStep,
          p.matchReason, p.source?.name, getCategoryName(p.categoryId)
        ].join(' ').toLowerCase();
        if (!hay.includes(keyword)) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      if (state.currentSort === 'newest') {
        if (a.issueDate === b.issueDate) return b.id - a.id;
        return (b.issueDate || '').localeCompare(a.issueDate || '');
      } else if (state.currentSort === 'oldest') {
        if (a.issueDate === b.issueDate) return a.id - b.id;
        return (a.issueDate || '').localeCompare(b.issueDate || '');
      }
      return (b.matchScore - a.matchScore) || (b.id - a.id);
    });

    const totalCount = filtered.length;
    const pageSize = state.pageSize || 60;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    if (state.currentPage > totalPages) state.currentPage = totalPages;
    if (state.currentPage < 1) state.currentPage = 1;

    if (totalPages > 1) {
      dom.resultsCount.textContent = `${t.resultsCount(totalCount, projects.length)} · ${t.pageOf(state.currentPage, totalPages, totalCount)}`;
    } else {
      dom.resultsCount.textContent = t.resultsCount(totalCount, projects.length);
    }

    const hasFilter = state.currentCategory !== 'all' || state.searchKeyword || state.favoritesOnly;
    dom.resetFilterLink.style.display = hasFilter ? 'inline-block' : 'none';

    if (totalCount === 0) {
      dom.casesGrid.style.display = 'none';
      dom.emptyState.style.display = 'block';
      if (dom.paginationWrap) {
        dom.paginationWrap.style.display = 'none';
        dom.paginationWrap.innerHTML = '';
      }
      return;
    }

    dom.casesGrid.style.display = 'grid';
    dom.emptyState.style.display = 'none';

    const startIndex = (state.currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);

    dom.casesGrid.innerHTML = paginated.map(p => {
      const catName = getCategoryName(p.categoryId);
      const gradeClass = getGradeClass(p.source?.grade);
      const isFav = state.favorites.has(p.id);

      return `
        <div class="case-card" data-case-id="${p.id}" tabindex="0" role="button" aria-label="${escapeHtml(p.title)}">
          <div>
            <div class="card-header-row">
              <div class="card-badges">
                <span class="badge badge-cat">${escapeHtml(catName)}</span>
                <span class="badge badge-grade ${gradeClass}">Grade ${escapeHtml(p.source?.grade || '')}</span>
              </div>
              <button class="card-fav-btn ${isFav ? 'active' : ''}" data-fav-case-id="${p.id}" title="${isFav ? (state.lang === 'en' ? 'Saved' : '已加入想做的') : (state.lang === 'en' ? 'Save' : '加入想做的')}" aria-label="Save">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            <h3 class="card-title">${escapeHtml(p.title)}</h3>

            <p class="card-valueline">${escapeHtml(p.what)}</p>

            <div class="card-stats-row">
              <span class="stat-tag stat-score">🎯 ${p.matchScore}</span>
              <span class="stat-tag">📅 ${escapeHtml(p.issueDate)}</span>
            </div>
          </div>

          <div class="card-footer">
            <div class="card-source-info" title="${escapeHtml(p.source?.name || '')}">
              <span>${escapeHtml(p.source?.name || '')}</span>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              ${p.source?.url ? `
                <a href="${escapeHtml(p.source.url)}" target="_blank" rel="noopener noreferrer" class="source-link-btn" title="Verify original source" data-source-link="true">
                  <span>${t.sourceLink}</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              ` : ''}
              <span class="card-detail-action">${t.viewDetails}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const cardEls = dom.casesGrid.querySelectorAll('.case-card');
    cardEls.forEach(card => {
      const id = Number(card.getAttribute('data-case-id'));
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-source-link]') || e.target.closest('[data-fav-case-id]')) {
          return;
        }
        openCaseModal(id);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.closest('[data-source-link]') || e.target.closest('[data-fav-case-id]')) {
            return;
          }
          e.preventDefault();
          openCaseModal(id);
        }
      });

      const srcLink = card.querySelector('[data-source-link]');
      if (srcLink) {
        srcLink.addEventListener('click', (e) => e.stopPropagation());
      }

      const favBtn = card.querySelector(`[data-fav-case-id="${id}"]`);
      if (favBtn) {
        favBtn.addEventListener('click', (e) => toggleFavorite(id, e));
      }
    });

    renderPagination(totalPages, totalCount);
  }

  // 渲染分页控件
  function renderPagination(totalPages, totalCount) {
    if (!dom.paginationWrap) return;
    if (totalPages <= 1) {
      dom.paginationWrap.style.display = 'none';
      dom.paginationWrap.innerHTML = '';
      return;
    }

    const t = I18N[state.lang];
    dom.paginationWrap.style.display = 'flex';

    const cur = state.currentPage;
    let html = '';

    // 上一页
    const prevDisabled = cur === 1 ? 'disabled' : '';
    html += `
      <button class="pagination-btn pagination-prev" data-page="${cur - 1}" ${prevDisabled}>
        &larr; ${t.pagePrev}
      </button>
    `;

    // 页码智能折叠
    const pagesToShow = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pagesToShow.push(i);
    } else {
      pagesToShow.push(1);
      if (cur > 3) pagesToShow.push('...');
      const start = Math.max(2, cur - 1);
      const end = Math.min(totalPages - 1, cur + 1);
      for (let i = start; i <= end; i++) pagesToShow.push(i);
      if (cur < totalPages - 2) pagesToShow.push('...');
      pagesToShow.push(totalPages);
    }

    pagesToShow.forEach(p => {
      if (p === '...') {
        html += `<span class="pagination-ellipsis">&hellip;</span>`;
      } else {
        const isActive = p === cur ? 'active' : '';
        html += `
          <button class="pagination-btn ${isActive}" data-page="${p}" aria-label="Page ${p}">
            ${p}
          </button>
        `;
      }
    });

    // 下一页
    const nextDisabled = cur === totalPages ? 'disabled' : '';
    html += `
      <button class="pagination-btn pagination-next" data-page="${cur + 1}" ${nextDisabled}>
        ${t.pageNext} &rarr;
      </button>
    `;

    html += `
      <span class="pagination-info">${t.pageOf(cur, totalPages, totalCount)}</span>
    `;

    dom.paginationWrap.innerHTML = html;

    const btns = dom.paginationWrap.querySelectorAll('.pagination-btn[data-page]');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.hasAttribute('disabled')) return;
        const targetPage = Number(btn.getAttribute('data-page'));
        if (targetPage >= 1 && targetPage <= totalPages && targetPage !== state.currentPage) {
          state.currentPage = targetPage;
          renderCasesGrid();
          scrollToGrid();
        }
      });
    });
  }

  function scrollToGrid() {
    const target = dom.resultsCount || dom.categoryTabs || dom.casesGrid;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // 5b. 渲染避坑区
  function renderWarnings() {
    if (!dom.warningsGrid) return;
    const warnings = state.data.warnings || [];
    const t = I18N[state.lang];

    dom.warningsGrid.innerHTML = warnings.map(w => {
      const catName = (w.categoryId !== null && w.categoryId !== undefined) ? getCategoryName(w.categoryId) : '';
      return `
        <div class="warning-card" data-open-warning="${w.id}" tabindex="0" role="button" aria-label="${escapeHtml(w.title)}">
          <div class="warning-card-top">
            <span class="badge badge-warning">${t.warningBadge}</span>
            ${catName ? `<span class="badge badge-cat">${escapeHtml(catName)}</span>` : ''}
            <span class="stat-tag">📅 ${escapeHtml(w.issueDate)}</span>
          </div>
          <h3 class="warning-title">${escapeHtml(w.title)}</h3>
          <p class="warning-reason">${escapeHtml(w.reason)}</p>
          <div class="warning-footer">
            <span class="card-source-info">${escapeHtml(w.source?.name || '')}</span>
            <span class="card-detail-action">${t.viewDetails}</span>
          </div>
        </div>
      `;
    }).join('');

    const cards = dom.warningsGrid.querySelectorAll('.warning-card');
    cards.forEach(card => {
      const id = Number(card.getAttribute('data-open-warning'));
      card.addEventListener('click', () => openWarningModal(id));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openWarningModal(id);
        }
      });
    });
  }

  // 避坑详情弹窗
  function openWarningModal(id) {
    const numId = Number(id);
    const w = (state.data.warnings || []).find(item => item.id === numId);
    if (!w) return;

    state.activeModalWarningId = numId;
    state.activeModalCaseId = null;
    const t = I18N[state.lang];
    const catName = (w.categoryId !== null && w.categoryId !== undefined) ? getCategoryName(w.categoryId) : '';
    const basePath = window.location.pathname.includes('/en/') ? '../' : './';

    dom.modalMeta.innerHTML = `
      <span class="badge badge-warning">${t.warningBadge}</span>
      ${catName ? `<span class="badge badge-cat">${escapeHtml(catName)}</span>` : ''}
      <span class="stat-tag">📅 ${escapeHtml(w.issueDate)}</span>
    `;

    if (dom.modalFavBtn) dom.modalFavBtn.style.display = 'none';

    let bodyHtml = `
      <div class="detail-flow">
        <div class="detail-header">
          <h2 class="detail-title" style="margin-top: 0;">${escapeHtml(w.title)}</h2>
        </div>
        <div class="detail-section">
          <div class="pitfalls-callout">
            <div class="pitfalls-callout-label">${t.modalWarningReason}</div>
            <div class="pitfalls-callout-text">${escapeHtml(w.reason)}</div>
          </div>
        </div>
    `;

    if (w.source) {
      bodyHtml += `
        <div class="detail-section">
          <div class="detail-label">${t.modalSource}</div>
          <div class="source-verify-box">
            <div class="source-meta-left">
              <span>${t.modalAuthor}：<strong>${escapeHtml(w.source.name || '')}</strong></span>
              <span>&bull;</span>
              <span>${t.modalDate}：${escapeHtml(w.issueDate)}</span>
            </div>
            ${w.source.url ? `
              <a href="${escapeHtml(w.source.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="padding: 6px 14px; font-size: 0.82rem;">
                <span>${t.modalVisitSource}</span>
              </a>
            ` : ''}
          </div>
        </div>
      `;
    }

    bodyHtml += `</div>`;
    dom.modalBody.innerHTML = bodyHtml;

    dom.modalFooter.innerHTML = `
      <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
        <span>${t.modalGuaranteed}</span>
        <span>&bull;</span>
        <a href="${basePath}warning/${w.id}/" target="_blank" style="color: var(--accent-caramel); text-decoration: underline; font-weight: 600;" title="${t.modalDedicated}">
          ${t.modalDedicated}
        </a>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button class="btn btn-outline" id="modalFooterCloseBtn" style="padding: 7px 14px; font-size: 0.82rem;">${t.modalClose}</button>
      </div>
    `;

    const footerCloseBtn = document.getElementById('modalFooterCloseBtn');
    if (footerCloseBtn) {
      footerCloseBtn.addEventListener('click', closeCaseModal);
    }

    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('project');
      url.searchParams.set('warning', String(numId));
      window.history.replaceState({ warningId: numId }, '', url.toString());
      document.title = `${w.title} - ${state.data.site}`;
    } catch (e) {}

    dom.caseModal.classList.add('open');
    dom.caseModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  // 6. 详情弹窗 Modal（项目）
  function openCaseModal(id) {
    const numId = Number(id);
    const p = (state.data.projects || []).find(item => item.id === numId);
    if (!p) return;

    state.activeModalCaseId = numId;
    state.activeModalWarningId = null;
    const catName = getCategoryName(p.categoryId);
    const gradeClass = getGradeClass(p.source?.grade);
    const isFav = state.favorites.has(numId);
    const t = I18N[state.lang];
    const basePath = window.location.pathname.includes('/en/') ? '../' : './';

    if (dom.modalFavBtn) dom.modalFavBtn.style.display = '';

    dom.modalMeta.innerHTML = `
      <span class="badge badge-cat">${escapeHtml(catName)}</span>
      <span class="badge badge-grade ${gradeClass}">Grade ${escapeHtml(p.source?.grade || '')}</span>
      <span class="stat-tag stat-score">🎯 ${p.matchScore}</span>
      <span class="stat-tag">📅 ${escapeHtml(p.issueDate)}</span>
    `;

    updateModalFavState(isFav);

    let bodyHtml = `
      <div class="detail-flow">
        <div class="detail-header">
          <h2 class="detail-title" style="margin-top: 0;">${escapeHtml(p.title)}</h2>
          <div class="detail-valueline">${escapeHtml(p.what)}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">${t.modalMoneyLogic}</div>
          <div class="detail-text">${escapeHtml(p.moneyLogic)}</div>
        </div>

        <div class="detail-section">
          <div class="output-callout">
            <div class="output-callout-label">${t.modalEvidence}</div>
            <div class="output-callout-text">${p.incomeEvidence ? escapeHtml(p.incomeEvidence) : escapeHtml(t.modalEvidenceEmpty)}</div>
          </div>
        </div>

        <div class="detail-meta-grid">
          <div class="detail-section">
            <div class="detail-label">${t.modalCost}</div>
            <div class="detail-text">${escapeHtml(p.cost)}</div>
          </div>
          <div class="detail-section">
            <div class="detail-label">${t.modalTimeCost}</div>
            <div class="detail-text">${escapeHtml(p.timeCost)}</div>
          </div>
        </div>
    `;

    if (p.risks && p.risks.trim() !== '') {
      bodyHtml += `
        <div class="detail-section">
          <div class="pitfalls-callout">
            <div class="pitfalls-callout-label">${t.modalRisks}</div>
            <div class="pitfalls-callout-text">${escapeHtml(p.risks)}</div>
          </div>
        </div>
      `;
    }

    if (p.firstStep && p.firstStep.trim() !== '') {
      bodyHtml += `
        <div class="detail-section">
          <div class="detail-label">${t.modalFirstStep}</div>
          <div class="detail-text">${escapeHtml(p.firstStep)}</div>
        </div>
      `;
    }

    if (p.matchReason && p.matchReason.trim() !== '') {
      bodyHtml += `
        <div class="detail-section">
          <div class="detail-label">${t.modalMatch} · 🎯 ${p.matchScore}</div>
          <div class="detail-text">${escapeHtml(p.matchReason)}</div>
        </div>
      `;
    }

    if (p.source) {
      bodyHtml += `
        <div class="detail-section">
          <div class="detail-label">${t.modalSource}</div>
          <div class="source-verify-box">
            <div class="source-meta-left">
              <span>${t.modalAuthor}：<strong>${escapeHtml(p.source.name || '')}</strong></span>
              <span>&bull;</span>
              <span>${t.modalGrade}：<strong>Grade ${escapeHtml(p.source.grade || '')}</strong></span>
              <span>&bull;</span>
              <span>${t.modalDate}：${escapeHtml(p.issueDate)}</span>
            </div>
            ${p.source.url ? `
              <a href="${escapeHtml(p.source.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="padding: 6px 14px; font-size: 0.82rem;">
                <span>${t.modalVisitSource}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            ` : ''}
          </div>
        </div>
      `;
    }

    bodyHtml += `</div>`;

    dom.modalBody.innerHTML = bodyHtml;

    dom.modalFooter.innerHTML = `
      <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
        <span>${t.modalGuaranteed}</span>
        <span>&bull;</span>
        <a href="${basePath}project/${p.id}/" target="_blank" style="color: var(--accent-caramel); text-decoration: underline; font-weight: 600;" title="${t.modalDedicated}">
          ${t.modalDedicated}
        </a>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        ${p.source?.url ? `
          <a href="${escapeHtml(p.source.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding: 7px 14px; font-size: 0.82rem;">
            <span>${t.modalVisitSource}</span>
          </a>
        ` : ''}
        <button class="btn btn-outline" id="modalFooterCloseBtn" style="padding: 7px 14px; font-size: 0.82rem;">${t.modalClose}</button>
      </div>
    `;

    const footerCloseBtn = document.getElementById('modalFooterCloseBtn');
    if (footerCloseBtn) {
      footerCloseBtn.addEventListener('click', closeCaseModal);
    }

    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('warning');
      url.searchParams.set('project', String(numId));
      window.history.replaceState({ projectId: numId }, '', url.toString());
      document.title = `${p.title} - ${state.data.site}`;
    } catch (e) {}

    dom.caseModal.classList.add('open');
    dom.caseModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  // 关闭详情弹窗
  function closeCaseModal() {
    dom.caseModal.classList.remove('open');
    dom.caseModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    state.activeModalCaseId = null;
    state.activeModalWarningId = null;
    if (dom.modalFavBtn) dom.modalFavBtn.style.display = '';

    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('project');
      url.searchParams.delete('warning');
      window.history.replaceState({}, '', url.pathname + (url.hash || ''));
      document.title = state.data ? `${state.data.site} - ${state.data.subject}` : '搞钱项目库';
    } catch (e) {}
  }

  // 剪贴板兜底复制
  function fallbackCopyText(text) {
    const t = I18N[state.lang];
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(t.toastCopied);
    } catch (err) {
      showToast('Copy failed');
    }
    document.body.removeChild(textArea);
  }

  // Toast 吐司提示
  let toastTimer = null;
  function showToast(msg) {
    if (!dom.toast) return;
    dom.toast.textContent = msg;
    dom.toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      dom.toast.classList.remove('show');
    }, 2200);
  }

  // 绑定全局事件
  function bindGlobalEvents() {
    // 语言切换
    if (dom.langZhBtn) {
      dom.langZhBtn.addEventListener('click', () => setLanguage('zh'));
    }
    if (dom.langEnBtn) {
      dom.langEnBtn.addEventListener('click', () => setLanguage('en'));
    }

    // 搜索输入
    dom.searchInput.addEventListener('input', (e) => {
      state.searchKeyword = e.target.value;
      state.currentPage = 1;
      dom.clearSearchBtn.style.display = state.searchKeyword ? 'flex' : 'none';
      renderCasesGrid();
    });

    // 清空搜索
    dom.clearSearchBtn.addEventListener('click', () => {
      dom.searchInput.value = '';
      state.searchKeyword = '';
      state.currentPage = 1;
      dom.clearSearchBtn.style.display = 'none';
      dom.searchInput.focus();
      renderCasesGrid();
    });

    // 排序选择
    dom.sortSelect.addEventListener('change', (e) => {
      state.currentSort = e.target.value;
      state.currentPage = 1;
      renderCasesGrid();
    });

    // 只看收藏切换
    dom.favFilterBtn.addEventListener('click', () => {
      state.favoritesOnly = !state.favoritesOnly;
      state.currentPage = 1;
      if (state.favoritesOnly) {
        dom.favFilterBtn.classList.add('active');
      } else {
        dom.favFilterBtn.classList.remove('active');
      }
      renderCasesGrid();
    });

    // 重置所有筛选
    const resetFilters = () => {
      state.currentCategory = 'all';
      state.searchKeyword = '';
      state.currentPage = 1;
      dom.searchInput.value = '';
      dom.clearSearchBtn.style.display = 'none';
      state.favoritesOnly = false;
      dom.favFilterBtn.classList.remove('active');
      setCategory('all');
    };

    dom.resetFilterLink.addEventListener('click', resetFilters);
    dom.emptyResetBtn.addEventListener('click', resetFilters);

    // 弹窗关闭
    dom.modalCloseBtn.addEventListener('click', closeCaseModal);
    dom.caseModal.addEventListener('click', (e) => {
      if (e.target === dom.caseModal) {
        closeCaseModal();
      }
    });

    dom.modalFavBtn.addEventListener('click', (e) => {
      if (state.activeModalCaseId !== null) {
        toggleFavorite(state.activeModalCaseId, e);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dom.caseModal.classList.contains('open')) {
        closeCaseModal();
      }
    });
  }

  // 获取分类名称
  function getCategoryName(catId) {
    if (!state.data || !state.data.categories) return catId;
    const item = state.data.categories.find(c => String(c.id) === String(catId));
    return item ? item.name : catId;
  }

  // 辅助函数：信源 Grade 类
  function getGradeClass(grade) {
    if (grade === 'A') return 'grade-A';
    if (grade === 'B') return 'grade-B';
    if (grade === 'C') return 'grade-C';
    return '';
  }

  // HTML 转义
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
