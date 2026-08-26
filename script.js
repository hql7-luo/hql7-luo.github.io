document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("[data-nav-links]");
const languageToggle = document.querySelector("[data-language-toggle]");
const languageStatus = document.querySelector("[data-language-status]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const LANGUAGE_STORAGE_KEY = "portfolio-language";
const ZH_TRANSLATIONS = {
  "meta.title": "Haoqi Luo — 商业分析、AI 应用与战略",
  "meta.description": "Haoqi Luo 是华盛顿大学 Foster 商学院学生，专注于构建实用的 AI 应用、分析工具和运营决策系统。",
  "meta.ogDescription": "业务问题 → 结构化分析 → 实用技术方案与决策系统。",
  "meta.imageAlt": "Haoqi Luo 个人作品集：商业分析、AI 应用、战略与运营。",
  "a11y.skip": "跳至主要内容",
  "a11y.primaryNav": "主导航",
  "a11y.backToTop": "Haoqi Luo，返回顶部",
  "a11y.toggleNav": "展开或收起导航",
  "a11y.howIWork": "Haoqi 处理业务问题的方法",
  "a11y.themes": "作品集主题",
  "a11y.technologies": "使用的技术",
  "nav.work": "作品",
  "nav.experience": "经历",
  "nav.skills": "能力",
  "nav.education": "教育",
  "nav.contact": "联系",
  "action.viewWork": "查看精选作品",
  "action.contactMe": "联系我",
  "action.liveDemo": "在线演示",
  "hero.eyebrow": "商业分析 <span>·</span> AI 应用 <span>·</span> 战略与运营",
  "hero.thesis": "我将业务问题转化为<em>可验证的分析、实用的技术方案</em>和更清晰的决策。",
  "hero.context": "University of Washington · 华盛顿大学 Foster 商学院<br>工商管理文学学士 · 信息系统 + 运营与供应链",
  "how.label": "我的工作方式",
  "how.available": "2027 年 3 月起可入职",
  "how.problem.title": "业务问题",
  "how.problem.body": "找到真正需要解决的决策问题",
  "how.evidence.title": "证据",
  "how.evidence.body": "梳理数据、约束条件与关键权衡",
  "how.system.title": "系统实现",
  "how.system.body": "构建分析模型、工作流或产品工具",
  "how.decision.title": "决策",
  "how.decision.body": "让下一步行动更清晰",
  "how.gpa": "<strong>3.85</strong> / 4.00 GPA",
  "how.products": "<strong>4</strong> 个可运行产品项目",
  "themes.business": "业务理解",
  "themes.analytics": "严谨分析",
  "themes.ai": "AI 驱动工作流",
  "themes.execution": "技术落地",
  "work.kicker": "精选作品",
  "work.title": "产品构建与决策模型",
  "work.intro": "独立产品体现我的构建能力，学术团队项目展示分析能力；两者共同将业务情境转化为可执行决策。",
  "work.build": "构建",
  "work.featured": "重点产品",
  "work.featuredNote": "独立项目 · 可运行演示 · 经测试系统",
  "work.analyze": "分析",
  "analytics.title": "分析与决策建模",
  "analytics.note": "学术团队项目 · 量化结论 · 商业建议",
  "common.problem": "问题",
  "common.system": "系统",
  "common.evidence": "依据",
  "common.data": "数据",
  "common.method": "方法",
  "common.result": "结果",
  "common.impact": "影响",
  "common.finding": "发现",
  "b2b.openDemo": "打开 B2B Export Sales Workspace 在线演示",
  "b2b.imageAlt": "B2B Export Sales Workspace 询盘分析界面，展示相互关联的三步工作流",
  "b2b.visualLabel": "在线产品界面",
  "b2b.type": "销售运营 · 决策支持",
  "b2b.title": "B2B Export Sales Intelligence · 出口销售智能工作台",
  "b2b.summary": "一个支持中英文、以本地数据为核心的工作台，将分散的出口询盘转化为可追溯的客户、报价与跟进决策。",
  "b2b.problem": "RFQ、报价与跟进信息分散在邮箱、表格和个人记忆中。",
  "b2b.system": "询盘分析 → 客户 → 报价 → 跟进 → 分析看板。",
  "b2b.evidence": "EXW / FOB / CIF / DDP、Gross Margin 与 Markup 对比、双语界面、Excel 导入导出。",
  "b2b.metricsLabel": "B2B Export Sales Intelligence 项目指标",
  "b2b.metricTerms": "<strong>4</strong> 种贸易术语",
  "b2b.metricLanguages": "<strong>2</strong> 种界面语言",
  "b2b.metricWorkflow": "<strong>本地优先</strong> SQLite 工作流",
  "b2b.detailsTitle": "工作流详情",
  "b2b.details": "经过测试的报价引擎可处理汇率与成本逻辑；持久化关联让每条询盘都能追溯到客户、匹配产品、报价、任务和活动时间线。可选的 AI 辅助分析用于增强核心流程；即使没有 API Key，系统也可正常运行。",
  "fengshui.openDemo": "打开 FengShui Layout Planner 在线演示",
  "fengshui.imageAlt": "FengShui Layout Planner 编辑器，展示户型图、几何叠加层和 A/B/C 结构方案",
  "fengshui.visualLabel": "确定性优化界面",
  "fengshui.type": "规则引擎 · 空间优化",
  "fengshui.title": "FengShui Layout Planner · 风水户型规划工具",
  "fengshui.summary": "一款文化空间布局决策工具，将传统住宅规则、确定性几何计算与现代空间规划约束结合起来。",
  "fengshui.problem": "户型建议往往主观、不透明，也难以进行方案比较。",
  "fengshui.system": "可解释规则、可视化编辑、几何校验与 A/B/C 候选方案。",
  "fengshui.evidence": "每项评分均可追溯至固定规则；结构方案严格保留已声明的约束条件。",
  "fengshui.metricsLabel": "FengShui Layout Planner 项目指标",
  "fengshui.metricRules": "<strong>18</strong> 条确定性规则",
  "fengshui.metricDimensions": "<strong>5</strong> 个评分维度",
  "fengshui.metricLayers": "<strong>7</strong> 个分析图层",
  "fengshui.detailsTitle": "规则引擎详情",
  "fengshui.details": "应用不会生成随机 AI 评分。系统通过纯规则与几何计算评估已标注的户型，分别解释传统依据与现代空间逻辑，并且只允许自动移动用户确认的非承重隔墙。候选方案仅供概念层面参考，不属于施工图。",
  "food.openDemo": "打开 What to Eat Today 在线演示",
  "food.imageAlt": "What to Eat Today 首页，展示五步筛选与转盘式餐食候选",
  "food.visualLabel": "GitHub Pages 在线产品",
  "food.type": "消费产品 · 推荐逻辑",
  "food.title": "What to Eat Today · 今天吃什么",
  "food.summary": "一款快速、可解释的用餐决策产品，根据偏好和近期行为生成聚焦的本地餐食推荐。",
  "food.problem": "日常用餐决策耗时，也容易反复选择最近吃过的食物。",
  "food.system": "五项偏好问题、候选评分、加权选择与历史记录。",
  "food.evidence": "排除昨天吃过的餐食；2–3 天前的餐食权重下调至 0.35。",
  "food.metricsLabel": "What to Eat Today 项目指标",
  "food.metricDishes": "<strong>92</strong> 道本地餐食",
  "food.metricCategories": "<strong>23</strong> 个类别",
  "food.metricInputs": "<strong>5</strong> 项决策输入",
  "food.detailsTitle": "推荐逻辑详情",
  "food.details": "推荐系统完全在本地运行，不调用第三方推荐 API。预算、辣度、饮食目标、用餐人数和准备时间共同决定候选池；收藏、排除项、历史记录和偏好均保存在浏览器中。",
  "zhejiang.imageAlt": "Zhejiang Life Simulator 首页，展示城市、家庭、职业与种子化人生控制项",
  "zhejiang.type": "系统设计 · 种子化模拟",
  "zhejiang.title": "Zhejiang Life Simulator · 浙江人生模拟器",
  "zhejiang.summary": "一款由选择驱动的人生模拟产品，覆盖教育、职业、迁移、住房、关系与退休，用于展示确定性状态管理、内容系统和版本发布验证。",
  "zhejiang.metricEvents": "<strong>251</strong> 个事件",
  "zhejiang.metricEndings": "<strong>28</strong> 种结局",
  "zhejiang.metricTests": "<strong>70</strong> 项自动化测试",
  "zhejiang.metricRuns": "<strong>1,100</strong> 次种子化运行",
  "llm.imageAlt": "演示结果显示，OLS 模型解释了对数 API 价格变异的 57.5%",
  "llm.team": "UW IS 451 · 团队项目",
  "llm.type": "LLM 价格—性能分析 · 2026 年 4–6 月",
  "llm.title": "LLM API 价格的真正驱动因素是什么？",
  "llm.summary": "使用可解释的 OLS 回归，分析模型能力、参数规模、开放性、发布时间和供应商效应与付费 LLM API 价格之间的关联。",
  "llm.data": "453 条原始记录 → 299 个付费模型",
  "llm.method": "对数价格 OLS 回归：完整与精简模型",
  "llm.result": "R² 0.575 · 调整后 R² 0.555",
  "llm.award": "<span aria-hidden=\"true\">✦</span> The Most Trendy Technology Award（最具潮流科技奖）— UW IS 451",
  "llm.detailsTitle": "商业解读",
  "llm.details": "控制其他因素后，更强的模型能力和更大的参数量与更高价格相关；开源状态、更快输出速度和较新的发布时间与更低价格相关。供应商效应仍然显著。本分析解释的是相关性而非因果关系，可用于模型与任务匹配及价格基准比较。",
  "autozone.imageAlt": "AutoZone 团队演示页面，展示人力成本优化模型的分析结果",
  "autozone.team": "UW Supply Chain Analytics · 团队项目",
  "autozone.type": "优化与预测 · 2025 年 9–12 月",
  "autozone.title": "AutoZone 人力优化与需求预测",
  "autozone.summary": "将人力成本优化模型与需求预测结合，把货运需求转化为司机招聘、培训和运力配置建议。",
  "autozone.optimizationLabel": "优化",
  "autozone.optimization": "模型测算年度人工成本降低约 15%",
  "autozone.impact": "模型测算年度节省约 $142.7K",
  "autozone.forecastLabel": "预测",
  "autozone.forecast": "α = 0.75 指数平滑 · MAPE 约 6.3%",
  "autozone.claim": "以上为模型测算结果，不代表公司已实现的实际节省。",
  "autozone.detailsTitle": "模型与决策",
  "autozone.details": "优化模型在满足服务约束的同时，综合考虑司机、受训人员、招聘、培训、工资、生产率和里程需求。基于 2020–2025 年货运重量历史的预测，为 2026–2030 年人员配置情景提供依据。",
  "genz.imageAlt": "Z 世代团队演示散点图，显示总支出与收入的相关系数为 0.03",
  "genz.team": "学术分析 · 团队项目",
  "genz.type": "消费者分析 · 2025 年 3–6 月",
  "genz.title": "Z 世代消费者支出分析",
  "genz.summary": "从财务属性、消费类别、支付方式、购物频率、季节性和配送偏好等维度分析消费者行为，并将规律转化为商业建议。",
  "genz.data": "1,700 条 Z 世代记录 · 15 个属性",
  "genz.findingCorrelation": "收入与支出相关系数：r = 0.03",
  "genz.findingSpend": "样本中 50.6% 的记录支出高于收入",
  "genz.detailsTitle": "商业建议",
  "genz.details": "提供价格可负担但有意义的选择，突出风格与情感表达；围绕双周和季节性节奏安排促销，并在便利性与可负担配送之间取得平衡。在本样本中，不应仅凭较高收入判断消费者会有更高支出。",
  "term.segmentation": "客群细分",
  "term.consumerInsight": "消费者洞察",
  "experience.kicker": "经历",
  "experience.title": "运营、研究与数字化",
  "experience.intro": "这些经历将业务执行、结构化信息和实用数字工具连接起来。",
  "date.augSep": "8–9 月",
  "date.julAug": "7–8 月",
  "date.jun2026": "2026 年 6 月",
  "location.taizhou": "Taizhou, China · 中国台州",
  "location.wenzhou": "Wenzhou, China · 中国温州",
  "location.seattle": "Seattle, WA · 美国西雅图",
  "experience.yongzeng.role": "业务运营与数字化专员",
  "experience.yongzeng.bullet1": "协调订单从下单、规格核对到生产排期和交付节点的全过程。",
  "experience.yongzeng.bullet2": "主导公司网站从概念到上线，规划信息架构与产品展示，并独立完成响应式网站的设计和开发。",
  "experience.challenger.role": "国际贸易数据分析实习生",
  "experience.challenger.bullet1": "从企业匹配度、采购信号、竞争对手和需求等维度评估国际 B2B 潜在客户与市场。",
  "experience.challenger.bullet2": "使用 Excel 分析 Alibaba.com 国际站和 RFQ 数据，并借助 AI 辅助研究整理客户与产品信息，支持匹配和跟进决策。",
  "experience.caitong.role": "业务实习生",
  "experience.caitong.bullet1": "研究上市公司、行业板块和市场动态，为周期性市场复盘材料提供支持。",
  "experience.caitong.bullet2": "使用 Excel 收集、清洗并结构化公司与市场数据，支持一致的跨公司分析。",
  "skills.kicker": "能力",
  "skills.title": "分析与执行能力",
  "skills.intro": "概括展示我如何从业务问题出发，形成经验证的决策与可用产品。",
  "skills.analyzeMode": "<span>01</span> 分析",
  "skills.analyticsTitle": "商业与数据分析",
  "skills.analyticsSummary": "将业务问题转化为结构化证据和可解释的分析结论。",
  "skills.analyticsLabel": "商业与数据分析能力",
  "skills.optimizeMode": "<span>02</span> 优化",
  "skills.optimizationTitle": "优化与决策建模",
  "skills.optimizationSummary": "对权衡、约束、不确定性和运营决策进行建模。",
  "skills.optimizationLabel": "优化与决策建模能力",
  "skills.buildMode": "<span>03</span> 构建",
  "skills.aiTitle": "AI 与产品开发",
  "skills.aiSummary": "构建实用的 AI 辅助研究、工作流和产品体验。",
  "skills.aiLabel": "AI 与产品开发能力",
  "skills.deliverMode": "<span>04</span> 交付",
  "skills.engineeringTitle": "数据系统与工程",
  "skills.engineeringSummary": "支持可靠的本地数据流、版本管理与自动化验证。",
  "skills.engineeringLabel": "数据系统与工程能力",
  "term.dataVisualization": "数据可视化",
  "term.regression": "回归分析",
  "term.linearProgramming": "线性规划",
  "term.integerProgramming": "整数规划",
  "term.forecasting": "预测",
  "term.monteCarlo": "蒙特卡洛模拟（Oracle Crystal Ball）",
  "term.sensitivity": "敏感性分析",
  "term.decisionAnalysis": "决策分析",
  "term.llmApplications": "LLM 应用",
  "term.aiResearch": "AI 辅助研究",
  "term.agentWorkflows": "智能体工作流",
  "term.workflowAutomation": "工作流自动化",
  "education.kicker": "教育背景",
  "education.university": "University of Washington · 华盛顿大学",
  "education.school": "Foster School of Business · Foster 商学院",
  "education.degree": "工商管理学士（B.A.）",
  "education.expected": "预计 2027 年 3 月毕业",
  "education.concentrationsLabel": "专业方向",
  "education.concentrations": "信息系统<br>运营与供应链管理",
  "education.courseworkLabel": "相关课程",
  "education.coursework": "电子表格建模 · 库存与供应链管理 · 数据库管理",
  "honors.kicker": "荣誉",
  "honors.title": "荣誉与语言能力",
  "honors.trendy": "<strong>The Most Trendy Technology Award（最具潮流科技奖）</strong><br>UW IS 451",
  "honors.nineQuarters": "9 个季度",
  "honors.deansList": "<strong>Dean’s List（院长荣誉名单）</strong><br>University of Washington",
  "honors.annual": "<strong>Annual Dean’s List（年度院长荣誉名单）</strong><br>2023–24 · 2024–25 · 2025–26",
  "honors.mandarin": "普通话 <strong>母语</strong>",
  "honors.english": "英语 <strong>熟练</strong>",
  "contact.kicker": "联系",
  "contact.title": "让下一项决策更清晰。",
  "contact.intro": "我关注商业分析、AI 应用、产品、运营与战略方向的机会。",
  "footer.focus": "商业分析 · AI 应用 · 战略与运营",
};

const translatableElements = [...document.querySelectorAll("[data-i18n]")];
const englishValues = new Map(
  translatableElements.map((element) => {
    const attribute = element.dataset.i18nAttr;
    const value = attribute
      ? element.getAttribute(attribute) ?? ""
      : element.dataset.i18nMode === "html"
        ? element.innerHTML
        : element.textContent;
    return [element, value];
  }),
);

let currentLanguage = "en";

const readSavedLanguage = () => {
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved === "zh-CN" || saved === "zh" ? "zh-CN" : "en";
  } catch {
    return "en";
  }
};

const readUrlLanguage = () => {
  const language = new URLSearchParams(window.location.search).get("lang")?.toLowerCase();
  if (language === "zh") return "zh-CN";
  if (language === "en") return "en";
  return null;
};

const saveLanguage = (language) => {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Keep the language switch functional when storage is unavailable.
  }
};

const setLanguage = (language, { persist = true, announce = true } = {}) => {
  const normalizedLanguage = language === "zh-CN" || language === "zh" ? "zh-CN" : "en";

  translatableElements.forEach((element) => {
    const key = element.dataset.i18n;
    const translatedValue = ZH_TRANSLATIONS[key];
    const value = normalizedLanguage === "zh-CN" && translatedValue !== undefined
      ? translatedValue
      : englishValues.get(element);
    const attribute = element.dataset.i18nAttr;

    if (attribute) {
      element.setAttribute(attribute, value);
    } else if (element.dataset.i18nMode === "html") {
      element.innerHTML = value;
    } else {
      element.textContent = value;
    }
  });

  currentLanguage = normalizedLanguage;
  document.documentElement.lang = normalizedLanguage;
  document.documentElement.dataset.language = normalizedLanguage;

  if (languageToggle) {
    const isChinese = normalizedLanguage === "zh-CN";
    languageToggle.setAttribute("aria-pressed", String(isChinese));
    languageToggle.setAttribute("aria-label", isChinese ? "切换为英文" : "Switch language to Chinese");
    languageToggle.setAttribute("title", isChinese ? "切换为英文" : "Switch language to Chinese");
    languageToggle.querySelectorAll("[data-language-option]").forEach((option) => {
      option.classList.toggle(
        "is-active",
        option.dataset.languageOption === (isChinese ? "zh" : "en"),
      );
    });
  }

  if (persist) saveLanguage(normalizedLanguage);
  if (announce && languageStatus) {
    languageStatus.textContent = normalizedLanguage === "zh-CN"
      ? "页面语言已切换为中文。"
      : "Page language changed to English.";
  }
};

languageToggle?.addEventListener("click", () => {
  setLanguage(currentLanguage === "en" ? "zh-CN" : "en");
  setMenuOpen(false);
});

const urlLanguage = readUrlLanguage();
setLanguage(urlLanguage ?? readSavedLanguage(), {
  persist: urlLanguage !== null,
  announce: false,
});

window.portfolioI18n = Object.freeze({
  storageKey: LANGUAGE_STORAGE_KEY,
  get language() {
    return currentLanguage;
  },
  setLanguage,
  missingKeys: [...new Set(
    translatableElements
      .map((element) => element.dataset.i18n)
      .filter((key) => ZH_TRANSLATIONS[key] === undefined),
  )],
});

const setMenuOpen = (open) => {
  if (!navToggle || !navLinks) return;
  navToggle.setAttribute("aria-expanded", String(open));
  navLinks.classList.toggle("is-open", open);
};

navToggle?.addEventListener("click", () => {
  setMenuOpen(navToggle.getAttribute("aria-expanded") !== "true");
});

navLinks?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuOpen(false);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 860) setMenuOpen(false);
});

const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 18);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const revealItems = document.querySelectorAll(".reveal");
if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.08 },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && sections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      sectionLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    },
    { rootMargin: "-30% 0px -58%", threshold: [0.01, 0.15, 0.4] },
  );
  sections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});
