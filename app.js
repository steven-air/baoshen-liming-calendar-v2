(() => {
  'use strict';

  // 适配层只负责把旧站的真实历法结果排版到全新界面，不重新推算或覆盖原有数据。
  const state = { month: new Date(), selected: new Date() };
  const weekdayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const $ = (selector) => document.querySelector(selector);
  const pad = (value) => String(value).padStart(2, '0');
  const keyOf = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const dateFromKey = (key) => { const [year, month, day] = key.split('-').map(Number); return new Date(year, month - 1, day); };
  const infoOf = (date) => getDayInfo(date);
  const statusOf = (info) => dayStatus(info);
  const statusLabel = (status) => ({ major: '大忌之日', minor: '戒期', zhai: '斋戒月', safe: '普通日' }[status] || '普通日');

  function lunarText(info) {
    if (!info.lunar) return '农历待查';
    return `${info.lunar.isLeap ? '闰' : ''}${LUNAR_MONTH[info.lunar.month - 1]}${LUNAR_DAY[info.lunar.day - 1]}`;
  }

  function itemLabel(item) {
    if (item.sev === 'zhai') return item.t || '斋戒月';
    if (item.sev === 'major') return item.t || '大忌之日';
    return item.t || '戒期';
  }

  // 日期格中逐条显示原引擎返回的具体事项，避免同日多条戒期被合并或遗漏。
  function cellTags(info) {
    const tags = info.items.map((item) => ({
      label: itemLabel(item),
      className: item.sev === 'minor' ? 'caution' : item.sev,
      detail: [item.r, item.c].filter(Boolean).join('；'),
      icon: item.sev === 'major' ? '忌' : item.sev === 'zhai' ? '斋' : '戒',
    }));
    if (info.term) tags.push({ label: info.term.name, className: 'term', detail: '节气交接，宜顺时自守', icon: '节' });
    if (!tags.length) tags.push({ label: '普通日', className: 'safe', detail: '暂无特别标记', icon: '平' });
    return tags;
  }

  function compactItems(info) {
    return [...new Set(cellTags(info).map((tag) => tag.label))];
  }

  function renderCell(date, month) {
    const info = infoOf(date);
    const status = statusOf(info);
    const outside = date.getMonth() !== month;
    const selected = keyOf(date) === keyOf(state.selected);
    const today = sameDay(date, new Date());
    const tags = cellTags(info);
    const eventText = '';
    const safeNote = status === 'safe' ? '<span class="safe-note"><b>本日为毫无忌犯之日 ✓</b><small>宜保精养神 · 清心寡欲</small></span>' : '';
    return `<button class="day-cell status-${status}${outside ? ' outside' : ''}${selected ? ' selected' : ''}${today ? ' today' : ''}" type="button" role="gridcell" data-date="${keyOf(date)}" aria-label="${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${tags.map((tag) => tag.label).join('、')}"><span class="status-dot"></span><span class="solar-number">${date.getDate()}</span><span class="lunar-label">${lunarText(info)}</span><span class="pillar-label">${info.gz.name}日</span>${safeNote}<span class="tag-stack">${tags.map((tag) => `<span class="cell-tag tag-${tag.className}" title="${tag.detail}"><span class="tag-icon">${tag.icon}</span><span class="tag-text">${tag.label}</span></span>`).join('')}</span>${eventText ? `<span class="event-label">${eventText}</span>` : ''}</button>`;
  }

  function renderCalendar() {
    const year = state.month.getFullYear();
    const month = state.month.getMonth();
    const first = new Date(year, month, 1);
    const start = (first.getDay() + 6) % 7;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const previousLast = new Date(year, month, 0).getDate();
    const cells = [];
    for (let index = start - 1; index >= 0; index -= 1) cells.push(new Date(year, month - 1, previousLast - index));
    for (let day = 1; day <= lastDay; day += 1) cells.push(new Date(year, month, day));
    let nextDay = 1;
    while (cells.length < 42) cells.push(new Date(year, month + 1, nextDay++));
    const monthInfo = infoOf(new Date(year, month, 15));
    $('#monthTitle').textContent = `${year}年 ${month + 1}月`;
    $('#monthLunar').textContent = `${monthInfo.yearGZ.name}年 · ${monthInfo.monthGZ.name}月`;
    $('#mastheadEra').textContent = `岁次${monthInfo.yearGZ.name} · ${monthInfo.monthGZ.name}月`;
    $('#calendarGrid').innerHTML = cells.map((date) => renderCell(date, month)).join('');
    renderMonthNotes(year, month, cells.filter((date) => date.getMonth() === month));
  }

  function renderMonthNotes(year, month, dates) {
    const rows = dates.flatMap((date) => {
      const info = infoOf(date);
      const entries = [];
      if (info.term) entries.push(`<li><b>${date.getDate()}日 · ${info.term.name}</b><span>节气交接，宜顺时自守</span></li>`);
      info.items.filter((item) => item.sev !== 'zhai').slice(0, 1).forEach((item) => entries.push(`<li><b>${date.getDate()}日 · ${itemLabel(item)}</b><span>${item.t}</span></li>`));
      return entries;
    }).slice(0, 6);
    $('#monthNotes').innerHTML = rows.length ? rows.join('') : '<li><b>本月暂无节气记录</b><span>请以选日详情为准</span></li>';
    const active = dates.flatMap((date) => infoOf(date).items).filter((item) => item.sev !== 'zhai').length;
    $('#monthNoteSummary').textContent = `${year}年${month + 1}月 · 记录 ${active} 项戒期提示`;
  }

  function renderDrawer(date) {
    const info = infoOf(date);
    const status = statusOf(info);
    $('#drawerWeek').textContent = weekdayNames[date.getDay()];
    $('#drawerTitle').textContent = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    $('#drawerLunar').textContent = `${info.yearGZ.name}年 · ${lunarText(info)} · ${info.gz.name}日`;
    $('#drawerStatuses').innerHTML = compactItems(info).map((label) => `<span class="drawer-status ${status}">${label}</span>`).join('');
    const eventParts = [];
    if (info.term) eventParts.push(`节气：${info.term.name}`);
    info.items.forEach((item) => eventParts.push(`${itemLabel(item)}：${item.t}`));
    $('#drawerEvents').textContent = eventParts.join('；') || '本日暂无特别标记，宜守常自持。';
    $('#drawerAdvice').textContent = status === 'major' ? '节气交替或书中列明大忌，宜少劳少欲，谨守身心。' : status === 'minor' ? '本日有戒期提示，宜减省纷扰，清心自守。' : status === 'zhai' ? '值斋戒月，顺应节气，早卧早起，保养精气。' : '本日为毫无忌犯之日 ✓ 宜保精养神 · 清心寡欲';
    const today = new Date();
    $('#todaySummary').textContent = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 · ${weekdayNames[today.getDay()]}`;
    $('#todayNote').textContent = `${statusLabel(status)} · 当前查看 ${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function selectDate(date, syncMonth = true) {
    state.selected = date;
    if (syncMonth) state.month = new Date(date.getFullYear(), date.getMonth(), 1);
    renderCalendar();
    renderDrawer(date);
  }

  $('#prevMonth').addEventListener('click', () => { state.month.setMonth(state.month.getMonth() - 1); selectDate(new Date(state.month.getFullYear(), state.month.getMonth(), 1), false); });
  $('#nextMonth').addEventListener('click', () => { state.month.setMonth(state.month.getMonth() + 1); selectDate(new Date(state.month.getFullYear(), state.month.getMonth(), 1), false); });
  $('#jumpToday').addEventListener('click', () => selectDate(new Date()));
  $('#clearSelection').addEventListener('click', () => selectDate(new Date(state.month.getFullYear(), state.month.getMonth(), 1), false));
  $('#calendarGrid').addEventListener('click', (event) => { const cell = event.target.closest('[data-date]'); if (cell) selectDate(dateFromKey(cell.dataset.date)); });

  selectDate(new Date(), true);
})();
