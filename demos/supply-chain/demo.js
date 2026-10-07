/* Real SQLite demo export; no network calls beyond same-origin static files. */
'use strict';
const translations = {
  zh: {
    back:'← 查看项目案例',eyebrow:'供应链 · 真实数据交互 Demo',title:'从缺货暴露，走向可执行的复核清单。',scope:'DEMO 子集 · 200 个 series · 19,400 条记录 · 97 天',boundary:'这是按风险状态分层选取的真实数据展示子集，不代表全部 50,000 个 series / 485 万条记录。下方所有指标仅描述这 200 个 series。历史范围：2024 年 3 月 28 日至 7 月 2 日。',intro:'查看证据，筛选可管理的优先级清单，并对照实际销量与已评分的预测。销量使用发布方的全局归一化尺度，不代表实际件数或收入。',loading:'正在载入已验证的 Demo 记录…',trendNav:'历史趋势',priorityNav:'优先级清单',forecastNav:'实际与预测',sourceNav:'来源与限制',evidence:'01 · 证据',trendTitle:'观测销量与不可用小时趋势',trendNote:'两个按日期对齐的面板使用不同单位。每日缺货暴露 = 不可用小时 /（200 个 series × 16 个营业小时，06:00–22:00）。不可用小时可能掩盖需求，但这些数据无法计算损失销量。',trendDownload:'下载每日趋势 CSV',action:'02 · 管理行动',priorityTitle:'从可管理的复核清单开始',priorityNote:'原始风险规则保持不变：不可用营业小时占比 ≥25% 为 Critical，≥10% 为 High Risk；其余有缺货暴露、销量 CV >1 或均值为零的 series 为 Watch。此处的缺货率与销量贡献使用 2024 年 6 月 5 日至 7 月 2 日窗口。',status:'复核状态',attention:'Critical + High Risk',all:'全部状态',capacity:'复核容量',sort:'优先级排序',pipeline:'原分析优先级',salesSort:'最近观测销量',exposureSort:'缺货暴露',all200:'全部 200 个',series:'门店 : 商品',exposure:'不可用小时占比',share:'最近销量贡献',next7:'后续 7 天销量*',review:'查看',tableNote:'*历史下一时段尚未评分的归一化销量估计。点击“查看”可检查对应记录与预测。筛选只改变展示，不改变原风险状态。',queueDownload:'下载当前清单 CSV',validation:'03 · 验证',forecastTitle:'对照实际销量与留出期预测',forecastNote:'在前 90 天内用三个滚动验证窗口选择模型，再评估未触碰的 6 月 26 日至 7 月 2 日留出期。虚线预测已评分；点线表示 7 月 3–9 日尚无实际结果的预测。目标是记录销量，不是潜在需求。',forecastDownload:'下载所选预测 CSV',sourceTitle:'证据边界',limits:'数据缺少实际库存、供应商、采购订单、实际件数换算、成本、保质期和损耗记录。本页面支持调查复核，不能自动下单，也不声称财务节省。完整六页签 Streamlit 应用还支持显式假设下的规划情景，可从仓库本地运行。',repo:'仓库与本地 Streamlit 启动说明',dataset:'Dingdong-Inc / FreshRetailNet-50K 数据集',hosting:'公开静态交互浏览页部署在 GitHub Pages。无需登录或付费服务，不含远程统计或凭证。Plotly 本地随页加载，遵循 MIT 许可。原始观测值未改动；预测与分析字段为派生结果。',selection:'查看子集选择方法与构建元数据',manifest:'下载构建清单',records:'下载真实数据派生文件',footer:'独立公开数据分析作品集 · 全量数据结论在项目案例中单独展示。',daysKpi:'有缺货的观测日 · 子集',hoursKpi:'不可用营业小时 · 子集',reviewKpi:'需复核的 series · 最近 28 天',wapeKpi:'逐 series 选模 WAPE · 子集',salesAxis:'观测销量 · 归一化尺度',hoursAxis:'不可用营业小时',date:'日期',sales:'观测销量',hours:'缺货暴露',riskX:'最近 28 天销量占 Demo 子集比重',riskY:'不可用营业小时占比 · 最近 28 天',actual:'实际观测销量',scored:'留出期预测 · 已评分',future:'后续预测 · 尚未评分',holdout:'留出期',queueCount:'显示',of:'条；符合筛选条件共',recordsCount:'条',model:'选定模型',wape:'留出期 WAPE',noScore:'实际销量总和为零；WAPE 无定义',actionTitle:'复核建议',criticalAction:'优先调查可用性问题，并核实缺货原因。',highAction:'复核补货输入与持续缺货暴露。',watchAction:'检查间歇需求、可用性记录与在售状态。',healthyAction:'持续监控可用性与观测销量。',verify:'行动前仍需核实在售状态、库存余额、在途订单及实际提前期；现有数据无法确定缺货原因或采购数量。',error:'Demo 数据加载失败，请刷新页面。'
  }
};
const english = {};
document.querySelectorAll('[data-t]').forEach(node => { english[node.dataset.t] = node.textContent; });
Object.assign(english, {daysKpi:'Days with stockouts · subset',hoursKpi:'Unavailable operating hours · subset',reviewKpi:'Series requiring review · recent 28 days',wapeKpi:'Per-series selector WAPE · subset',salesAxis:'Observed sales · normalized scale',hoursAxis:'Unavailable operating hours',date:'Date',sales:'Observed sales',hours:'Stockout exposure',riskX:'Recent 28-day sales share of demo cohort',riskY:'Unavailable operating hours · recent 28 days',actual:'Actual observed sales',scored:'Holdout prediction · scored',future:'Future forecast · unscored',holdout:'Holdout',queueCount:'Showing',of:'of',recordsCount:'matching series',model:'Selected model',wape:'Holdout WAPE',noScore:'Actual sales sum is zero; WAPE is undefined',actionTitle:'Management review',criticalAction:'Prioritize availability investigation and validate stockout causes.',highAction:'Review replenishment inputs and persistent stockout exposure.',watchAction:'Check intermittent demand, availability records and active assortment.',healthyAction:'Continue monitoring availability and observed sales.',verify:'Verify active assortment, inventory balances, open orders and measured lead times before acting. These data cannot determine stockout causes or purchase quantities.',error:'Demo data could not be loaded. Please refresh this page.'});
let lang = new URLSearchParams(location.search).get('lang') === 'zh' ? 'zh' : 'en';
let data, queueRows = [], selectedId;
const $ = id => document.getElementById(id);
const t = key => (lang === 'zh' ? translations.zh[key] : english[key]) || english[key] || key;
const percent = value => `${(value * 100).toFixed(1)}%`;
const colors = {'Critical':'#a63838','High Risk':'#bf6c31','Watch':'#9a802b','Healthy':'#126b72'};
const modelNames = {naive:'Naive',seasonal_naive7:'Seasonal naive · 7 days',mean28:'Moving average · 28 days','ses_alpha0.3':'SES · α=0.3'};
function layout(height) {
  const mobile = innerWidth < 650;
  return {height, paper_bgcolor:'#fff', plot_bgcolor:'#fff', font:{family:'system-ui, sans-serif',color:'#142b43',size:mobile?11:13},margin:{l:mobile?58:72,r:20,t:mobile?90:60,b:65},legend:{orientation:'h',x:0,y:1.03,yanchor:'bottom'},hovermode:'x unified',xaxis:{gridcolor:'#edf1f4'},yaxis:{gridcolor:'#edf1f4',rangemode:'tozero'}};
}
const config = {responsive:true,displaylogo:false,modeBarButtonsToRemove:['lasso2d','select2d'],toImageButtonOptions:{format:'png',filename:'scdi-demo-chart',scale:2}};
function applyLanguage() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-t]').forEach(node => { node.textContent = t(node.dataset.t); });
  $('language').textContent = lang === 'en' ? '中文' : 'English';
  $('case-link').href = `../../projects/supply-chain-decision-intelligence.html?lang=${lang}`;
  if (data) renderAll();
}
function renderKpis() {
  $('kpis').replaceChildren();
  [[percent(data.kpis.stockout_day_rate),'daysKpi'],[percent(data.kpis.stockout_hour_rate),'hoursKpi'],[`${data.kpis.review_series} / 200`,'reviewKpi'],[percent(data.kpis.wape),'wapeKpi']].forEach(([value,label]) => {
    const box=document.createElement('div'); box.className='kpi'; const strong=document.createElement('strong'); strong.textContent=value; const caption=document.createElement('span'); caption.textContent=t(label); box.append(strong,caption); $('kpis').append(box);
  });
}
function renderTrend() {
  const spec=layout(innerWidth<650?440:470);
  spec.grid={rows:2,columns:1,pattern:'independent',roworder:'top to bottom'};
  spec.xaxis={showticklabels:false,domain:[0,1],anchor:'y'};
  spec.yaxis={title:{text:t('salesAxis')},domain:[0.56,1],rangemode:'tozero',gridcolor:'#edf1f4'};
  spec.xaxis2={title:{text:t('date')},domain:[0,1],anchor:'y2',tickformat:'%b %d'};
  spec.yaxis2={title:{text:t('hoursAxis')},domain:[0,0.37],tickformat:'.0%',rangemode:'tozero',gridcolor:'#edf1f4'};
  spec.hovermode='x';
  Plotly.react('trend-chart',[{x:data.dates,y:data.trend.sales,name:t('sales'),type:'scatter',mode:'lines',line:{color:'#245b93',width:2},hovertemplate:'%{x}<br>%{y:.2f}<extra></extra>'},{x:data.dates,y:data.trend.exposure,name:t('hours'),type:'scatter',mode:'lines',xaxis:'x2',yaxis:'y2',line:{color:'#bf6c31',width:2},hovertemplate:'%{x}<br>%{y:.1%}<extra></extra>'}],spec,config);
}
function renderRisk() {
  const spec=layout(innerWidth<650?390:420); spec.hovermode='closest'; spec.xaxis={title:{text:innerWidth<650?t('riskX').replace(lang==='zh'?'占 Demo 子集比重':'of demo cohort',lang==='zh'?'<br>占 Demo 子集比重':'<br>of demo cohort'):t('riskX')},tickformat:'.1%',rangemode:'tozero',gridcolor:'#edf1f4'}; spec.yaxis={title:{text:innerWidth<650?t('riskY').replace(' · ','<br>'):t('riskY')},tickformat:'.0%',range:[0,1],gridcolor:'#edf1f4'}; spec.shapes=[.1,.25].map(y=>({type:'line',xref:'paper',x0:0,x1:1,y0:y,y1:y,line:{color:'#7c8c9a',dash:'dot',width:1}}));
  const traces=Object.keys(colors).map(status=>{const rows=data.items.filter(row=>row.availability_risk===status);return {type:'scatter',mode:'markers',name:status,x:rows.map(row=>row.recent_sales_share),y:rows.map(row=>row.stockout_hour_rate),text:rows.map(row=>row.series_id),customdata:rows.map(row=>row.series_id),marker:{color:colors[status],size:8,opacity:.8},hovertemplate:`%{text}<br>${t('share')}: %{x:.2%}<br>${t('exposure')}: %{y:.1%}<extra>%{fullData.name}</extra>`};});
  Plotly.react('risk-chart',traces,spec,config);
}
function updateQueue() {
  const status=$('status').value, sort=$('sort').value;
  const filtered=data.items.filter(row=>status==='all'||(status==='attention'?['Critical','High Risk'].includes(row.availability_risk):row.availability_risk===status));
  filtered.sort((a,b)=>sort==='priority_rank'?a.priority_rank-b.priority_rank:(b[sort]-a[sort]||a.priority_rank-b.priority_rank));
  queueRows=filtered.slice(0,Number($('capacity').value));
  $('queue-count').textContent=`${t('queueCount')} ${queueRows.length} ${t('of')} ${filtered.length} ${t('recordsCount')}.`;
  $('queue').replaceChildren();
  queueRows.forEach(row=>{const tr=document.createElement('tr');[row.series_id,row.availability_risk,percent(row.stockout_hour_rate),percent(row.recent_sales_share),row.forecast_next7_sales.toFixed(2)].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td);});const td=document.createElement('td'),button=document.createElement('button');button.textContent=t('review');button.addEventListener('click',()=>{selectSeries(row.series_id);$('action-card').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});td.append(button);tr.append(td);$('queue').append(tr);});
}
function selectSeries(id) { selectedId=id; $('series-choice').value=id; renderForecast(); renderAction(); }
function renderAction() {
  const row=data.items.find(item=>item.series_id===selectedId); const action={Critical:'criticalAction','High Risk':'highAction',Watch:'watchAction',Healthy:'healthyAction'}[row.availability_risk];
  $('action-card').replaceChildren(); const title=document.createElement('h3');title.textContent=`${t('actionTitle')} · ${row.series_id} · ${row.availability_risk}`;const recommendation=document.createElement('p');recommendation.textContent=t(action);const evidence=document.createElement('p');evidence.textContent=`${t('exposure')}: ${percent(row.stockout_hour_rate)} · ${t('share')}: ${percent(row.recent_sales_share)} · CV: ${row.sales_cv===null?'Undefined':row.sales_cv.toFixed(2)}`;const limit=document.createElement('p');limit.className='note';limit.textContent=t('verify');$('action-card').append(title,recommendation,evidence,limit);
}
function renderForecast() {
  const item=data.items.find(row=>row.series_id===selectedId), hold=item.forecasts.filter(row=>row[3]==='holdout'), future=item.forecasts.filter(row=>row[3]==='future');
  const total=hold.reduce((sum,row)=>sum+Math.abs(row[1]),0),error=hold.reduce((sum,row)=>sum+Math.abs(row[2]-row[1]),0);
  $('series-score').textContent=`${t('model')}: ${modelNames[item.selected_model]||item.selected_model} · ${total?t('wape')+': '+percent(error/total):t('noScore')} · ${lang==='zh'?'7 天实际销量总和':'7-day actual sales total'}: ${total.toFixed(2)} (${lang==='zh'?'归一化尺度；单项 WAPE 对小分母敏感':'normalized scale; individual WAPE is sensitive to small denominators'})`;
  const spec=layout(innerWidth<650?410:440); spec.xaxis={title:{text:t('date')},tickformat:'%b %d',range:['2024-06-05','2024-07-10']};spec.yaxis.title={text:t('salesAxis')};spec.shapes=[{type:'rect',xref:'x',yref:'paper',x0:'2024-06-26',x1:'2024-07-02T23:59:59',y0:0,y1:1,fillcolor:'#edf5f3',opacity:.7,line:{width:0},layer:'below'}];
  Plotly.react('forecast-chart',[{x:data.dates,y:item.history.map(row=>row[0]),name:t('actual'),type:'scatter',mode:'lines+markers',marker:{size:4},line:{color:'#245b93',width:2}},{x:hold.map(row=>row[0]),y:hold.map(row=>row[2]),name:t('scored'),type:'scatter',mode:'lines+markers',line:{color:'#126b72',dash:'dash',width:2},marker:{size:6,symbol:'diamond'}},{x:future.map(row=>row[0]),y:future.map(row=>row[2]),name:t('future'),type:'scatter',mode:'lines',line:{color:'#9a802b',dash:'dot',width:2}}],spec,config);
}
function csvDownload(name,rows) {
  const csv=rows.map(row=>row.map(value=>`"${String(value??'').replaceAll('"','""')}"`).join(',')).join('\n');
  const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function renderAll(){renderKpis();renderTrend();renderRisk();updateQueue();renderForecast();renderAction();}
$('language').addEventListener('click',()=>{lang=lang==='en'?'zh':'en';const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);applyLanguage();});
['status','sort','capacity'].forEach(id=>$(id).addEventListener('change',updateQueue));
$('series-choice').addEventListener('change',event=>selectSeries(event.target.value));
$('trend-download').addEventListener('click',()=>csvDownload('demo-daily-trend.csv',[['date','observed_normalized_sales','stockout_operating_hour_rate'],...data.dates.map((date,i)=>[date,data.trend.sales[i],data.trend.exposure[i]])]));
$('queue-download').addEventListener('click',()=>{const keys=['series_id','availability_risk','priority_rank','stockout_hour_rate','recent_sales_total','recent_sales_share','forecast_next7_sales','recommendation','reason'];csvDownload('demo-current-priorities.csv',[keys,...queueRows.map(row=>keys.map(key=>row[key]))]);});
$('forecast-download').addEventListener('click',()=>{const item=data.items.find(row=>row.series_id===selectedId);csvDownload(`demo-forecast-${selectedId.replace(':','-')}.csv`,[['date','actual_normalized_sales','predicted_normalized_sales','split'],...item.forecasts]);});
applyLanguage();
fetch('data.json').then(response=>{if(!response.ok)throw new Error('Data request failed');return response.json();}).then(payload=>{
  if(payload.scope!=='demo'||payload.series_count!==200||payload.rows!==19400)throw new Error('Invalid demo scope');data=payload;selectedId=data.items[0].series_id;
  [...data.items].sort((a,b)=>a.series_id.localeCompare(b.series_id,undefined,{numeric:true})).forEach(row=>{const option=document.createElement('option');option.value=row.series_id;option.textContent=`${row.series_id} · ${row.availability_risk}`;$('series-choice').append(option);});$('series-choice').value=selectedId;
  $('build-info').textContent=JSON.stringify({scope:'demo only',series:200,rows:19400,days:97,source_revision:data.source_revision,selection_rule:data.selection_rule},null,2);renderAll();
}).catch(error=>{$('kpis').textContent=t('error');$('kpis').setAttribute('role','alert');console.error(error);});
