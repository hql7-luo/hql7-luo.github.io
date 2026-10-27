/* Explore the published SEC snapshot in the browser; no live source requests. */
(() => {
  'use strict';
  const script = document.currentScript;
  const dataUrl = new URL('explorer.json', script.src);
  const industry = document.getElementById('ai-industry');
  const company = document.getElementById('ai-company');
  const outcome = document.getElementById('ai-outcome');
  const selection = document.getElementById('ai-selection');
  const status = document.getElementById('ai-status');
  const table = document.getElementById('ai-data-body');
  const retry = document.getElementById('ai-retry');
  const trendChart = document.getElementById('ai-trend-chart');
  const performanceChart = document.getElementById('ai-performance-chart');
  if (![industry, company, outcome, selection, status, table, retry, trendChart, performanceChart].every(Boolean)) return;
  const core = window.PortfolioCore;
  const svgNamespace = 'http://www.w3.org/2000/svg';
  let rows = [];
  let asOf = '';
  let state = 'loading';
  let activeRequest = 0;

  const copy = {
    en: {
      allIndustries: 'All industries', allCompanies: 'All companies',
      growth: 'Next fiscal-year revenue growth', return: '12-month return above SPY',
      loading: 'Loading the published data snapshot…',
      error: 'The data snapshot could not be loaded. Please retry.', retry: 'Retry loading data',
      noData: 'No observed values for this selection.', source: 'Open 10-K',
      filings: 'filings', firms: 'companies', revenue: 'observed revenue outcomes',
      returns: 'complete stock-return windows', snapshot: 'Snapshot cutoff',
      intensity: 'AI mentions per 10,000 words', growthAxis: 'Next-FY growth (%)',
      returnAxis: 'Return above SPY (percentage points)', year: '10-K filing year',
      means: 'Filing-year means; each observed report has equal weight.',
      missing: 'Missing outcomes are omitted separately for each measure.',
      latest: 'Showing up to 12 of the most recent filings in the selection.',
      available: 'observations', mean: 'Mean', notAvailable: 'Unavailable'
    },
    zh: {
      allIndustries: '全部行业', allCompanies: '全部公司',
      growth: '下一财年营收增长率', return: '发布后 12 个月超 SPY 收益',
      loading: '正在读取已发布的数据快照……',
      error: '数据快照未能加载，请重试。', retry: '重新加载数据',
      noData: '当前选择没有可用观测值。', source: '查看 10-K',
      filings: '份年报', firms: '家公司', revenue: '个可用营收结果',
      returns: '个完整股价窗口', snapshot: '数据截止',
      intensity: '每万词 AI 提及次数', growthAxis: '下一财年营收增长率（%）',
      returnAxis: '超 SPY 收益（百分点）', year: '10-K 发布年份',
      means: '按年报发布年份取均值；每份可用年报权重相同。',
      missing: '两种结果分别排除缺失值。',
      latest: '表格最多显示当前选择中最新的 12 份年报。',
      available: '个观测值', mean: '均值', notAvailable: '不可用'
    }
  };
  const industriesZh = {
    'Construction': '建筑业',
    'Finance, insurance & real estate': '金融、保险与房地产',
    'Manufacturing': '制造业',
    'Mining': '采矿业',
    'Retail trade': '零售业',
    'Services': '服务业',
    'Transportation & utilities': '交通运输与公用事业',
    'Wholesale trade': '批发业'
  };
  const language = () => core?.lang === 'zh' ? 'zh' : 'en';
  const text = () => copy[language()];
  const number = (value, digits = 2) => new Intl.NumberFormat(language() === 'zh' ? 'zh-CN' : 'en-US', {
    maximumFractionDigits: digits
  }).format(value);
  const observed = value => typeof value === 'number' && Number.isFinite(value);
  const mean = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  const selectedRows = () => rows.filter(row =>
    (!industry.value || row.industry === industry.value) && (!company.value || row.ticker === company.value));

  // Native select controls keep keyboard and mobile interactions familiar.
  function setOptions(control, values, selected) {
    control.replaceChildren(...values.map(([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      return option;
    }));
    control.value = values.some(([value]) => value === selected) ? selected : '';
  }

  function updateOptions() {
    const t = text();
    const selectedIndustry = industry.value;
    const selectedCompany = company.value;
    setOptions(industry, [['', t.allIndustries], ...[...new Set(rows.map(row => row.industry))].sort()
      .map(value => [value, language() === 'zh' ? industriesZh[value] || value : value])], selectedIndustry);
    const availableCompanies = new Map(rows.filter(row => !industry.value || row.industry === industry.value)
      .map(row => [row.ticker, row.company]));
    setOptions(company, [['', t.allCompanies], ...[...availableCompanies].sort(([a], [b]) => a.localeCompare(b))
      .map(([ticker, name]) => [ticker, `${ticker} · ${name}`])], selectedCompany);
    setOptions(outcome, [['growth', t.growth], ['return', t.return]], outcome.value || 'growth');
  }

  // Missing years and unavailable outcomes break the line rather than becoming zeroes.
  function yearSeries(selected, field, scale = 1) {
    const years = selected.map(row => row.filing_year);
    if (!years.length) return [];
    const first = Math.min(...years);
    const last = Math.max(...years);
    return Array.from({length: last - first + 1}, (_, index) => {
      const year = first + index;
      const values = selected.filter(row => row.filing_year === year && observed(row[field])).map(row => row[field] * scale);
      return {year, value: mean(values), count: values.length};
    });
  }

  function svgElement(name, attributes = {}, value) {
    const element = document.createElementNS(svgNamespace, name);
    for (const [key, attr] of Object.entries(attributes)) element.setAttribute(key, String(attr));
    if (value !== undefined) element.textContent = value;
    return element;
  }

  function axisStep(range) {
    const base = 10 ** Math.floor(Math.log10(range / 4));
    const ratio = range / 4 / base;
    return (ratio <= 1 ? 1 : ratio <= 2 ? 2 : ratio <= 5 ? 5 : 10) * base;
  }

  function drawChart(container, series, title, axisLabel, unit) {
    const t = text();
    const valid = series.filter(point => observed(point.value));
    container.replaceChildren();
    if (!valid.length) {
      const empty = document.createElement('p');
      empty.className = 'ai-empty';
      empty.textContent = t.noData;
      container.append(empty);
      return;
    }
    const width = Math.max(260, container.clientWidth || 520);
    const height = 300;
    const left = 62;
    const right = width - 18;
    const top = 32;
    const bottom = height - 52;
    let low = Math.min(0, ...valid.map(point => point.value));
    let high = Math.max(0, ...valid.map(point => point.value));
    if (low === high) high = low + 1;
    const step = axisStep(high - low);
    low = Math.floor(low / step) * step;
    high = Math.ceil(high / step) * step;
    const x = year => series.length > 1 ? left + (year - series[0].year) / (series.at(-1).year - series[0].year) * (right - left) : (left + right) / 2;
    const y = value => bottom - (value - low) / (high - low) * (bottom - top);
    const chartId = container.id;
    const svg = svgElement('svg', {viewBox: `0 0 ${width} ${height}`, width: '100%', height,
      role: 'img', 'aria-labelledby': `${chartId}-title ${chartId}-description`});
    svg.append(svgElement('title', {id: `${chartId}-title`}, title));
    svg.append(svgElement('desc', {id: `${chartId}-description`},
      `${axisLabel}. ${t.means} ${t.missing} ` + valid.map(point => `${point.year}: ${number(point.value)}${unit}, ${point.count} ${t.available}`).join('; ')));
    svg.append(svgElement('text', {x: 10, y: 17, class: 'ai-axis-title'}, axisLabel));
    for (let index = 0; index <= Math.round((high - low) / step); index++) {
      const value = low + index * step;
      svg.append(svgElement('line', {x1: left, x2: right, y1: y(value), y2: y(value), class: value === 0 ? 'ai-zero-line' : 'ai-grid-line'}));
      svg.append(svgElement('text', {x: left - 9, y: y(value) + 4, 'text-anchor': 'end', class: 'ai-axis-label'}, number(value, 2)));
    }
    const every = Math.max(1, Math.ceil(series.length / Math.max(2, Math.floor((right - left) / 58))));
    series.forEach((point, index) => {
      if (index % every !== 0 && index !== series.length - 1) return;
      svg.append(svgElement('text', {x: x(point.year), y: bottom + 23, 'text-anchor': 'middle', class: 'ai-axis-label'}, point.year));
    });
    svg.append(svgElement('text', {x: (left + right) / 2, y: height - 7, 'text-anchor': 'middle', class: 'ai-axis-label'}, t.year));
    let segment = [];
    const addSegment = () => {
      if (segment.length > 1) svg.append(svgElement('polyline', {points: segment.map(point => `${x(point.year)},${y(point.value)}`).join(' '), class: 'ai-chart-line'}));
      segment = [];
    };
    for (const point of series) {
      if (observed(point.value)) segment.push(point);
      else addSegment();
    }
    addSegment();
    for (const point of valid) {
      const dot = svgElement('circle', {cx: x(point.year), cy: y(point.value), r: 3.5, class: 'ai-chart-dot'});
      dot.append(svgElement('title', {}, `${point.year} · ${t.mean}: ${number(point.value)}${unit} · ${point.count} ${t.available}`));
      svg.append(dot);
    }
    container.append(svg);
  }

  function renderCharts(selected = selectedRows()) {
    const t = text();
    drawChart(trendChart, yearSeries(selected, 'ai_intensity'), t.intensity, t.intensity, '');
    const growth = outcome.value === 'growth';
    drawChart(performanceChart, yearSeries(selected, growth ? 'next_revenue_growth' : 'excess_return_12m', 100),
      growth ? t.growth : t.return, growth ? t.growthAxis : t.returnAxis, growth ? '%' : ' pp');
  }

  function renderTable(selected) {
    const t = text();
    const latest = [...selected].sort((a, b) => b.filing_date.localeCompare(a.filing_date) || a.ticker.localeCompare(b.ticker)).slice(0, 12);
    table.replaceChildren(...latest.map(row => {
      const line = document.createElement('tr');
      const values = [`${row.ticker} · ${row.company}`, String(row.filing_year), number(row.ai_intensity),
        observed(row.next_revenue_growth) ? `${number(100 * row.next_revenue_growth)}%` : '—',
        observed(row.excess_return_12m) ? `${number(100 * row.excess_return_12m)} ${language() === 'zh' ? '百分点' : 'pp'}` : '—'];
      values.forEach((value, index) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        if (index === 1) cell.title = `${row.filing_date} · FY${row.fiscal_year}`;
        line.append(cell);
      });
      const sourceCell = document.createElement('td');
      const source = document.createElement('a');
      source.href = row.url;
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
      source.textContent = t.source;
      source.setAttribute('aria-label', `${row.ticker} ${row.filing_date} · ${t.source}`);
      sourceCell.append(source);
      line.append(sourceCell);
      return line;
    }));
  }

  function render() {
    const t = text();
    retry.textContent = t.retry;
    if (state !== 'ready') {
      status.textContent = state === 'error' ? t.error : t.loading;
      return;
    }
    updateOptions();
    const selected = selectedRows();
    const firms = new Set(selected.map(row => row.ticker)).size;
    const revenueCount = selected.filter(row => observed(row.next_revenue_growth)).length;
    const returnCount = selected.filter(row => observed(row.excess_return_12m)).length;
    const firmLabel = language() === 'en' && firms === 1 ? 'company' : t.firms;
    selection.textContent = `${number(firms, 0)} ${firmLabel} · ${number(selected.length, 0)} ${t.filings} · ${number(revenueCount, 0)} ${t.revenue} · ${number(returnCount, 0)} ${t.returns}`;
    status.textContent = `${t.snapshot}: ${asOf}. ${t.means} ${t.missing} ${t.latest}`;
    renderCharts(selected);
    renderTable(selected);
  }

  // A bounded request and visible retry keep a failed download understandable.
  async function load() {
    const requestId = ++activeRequest;
    state = 'loading';
    [industry, company, outcome].forEach(control => { control.disabled = true; });
    retry.hidden = true;
    render();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(dataUrl, {signal: controller.signal});
      if (!response.ok) throw new Error(`Snapshot HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.rows) || !data.rows.length || typeof data.as_of !== 'string') throw new Error('Invalid snapshot');
      for (const row of data.rows) {
        if (![row.ticker, row.company, row.industry, row.filing_date].every(value => typeof value === 'string') ||
            !Number.isInteger(row.filing_year) || !Number.isInteger(row.fiscal_year) || !observed(row.ai_intensity) ||
            ![row.next_revenue_growth, row.excess_return_12m].every(value => value === null || observed(value)) ||
            typeof row.url !== 'string' || !row.url.startsWith('https://www.sec.gov/Archives/')) throw new Error('Invalid snapshot row');
      }
      if (requestId !== activeRequest) return;
      rows = data.rows;
      asOf = data.as_of;
      state = 'ready';
      [industry, company, outcome].forEach(control => { control.disabled = false; });
      render();
    } catch (error) {
      if (requestId !== activeRequest) return;
      state = 'error';
      retry.hidden = false;
      render();
    } finally {
      clearTimeout(timeout);
    }
  }

  industry.addEventListener('change', render);
  company.addEventListener('change', render);
  outcome.addEventListener('change', render);
  retry.addEventListener('click', load);
  core?.on('language', render);
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { if (state === 'ready') renderCharts(); }).observe(trendChart);
  }
  load();
})();
