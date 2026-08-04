document.addEventListener('DOMContentLoaded', () => {
  const totalTimeEl = document.getElementById('totalTime');
  const timeLabelEl = document.getElementById('timeLabel');
  const totalSessionsEl = document.getElementById('totalSessions');
  const activeDaysEl = document.getElementById('activeDays');
  const totalLanguagesEl = document.getElementById('totalLanguages');
  const languagesListEl = document.getElementById('languagesList');
  const domainsListEl = document.getElementById('domainsList');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const heatmapGrid = document.getElementById('heatmapGrid');
  const heatmapMonths = document.getElementById('heatmapMonths');
  const listeningChart = document.getElementById('listeningChart');
  const listeningFooter = document.getElementById('listeningFooter');
  const patternsTimeLabel = document.getElementById('patternsTimeLabel');

  let allSessions = [];

  const langMap = {
    'fa': 'Persian', 'en': 'English', 'es': 'Spanish', 'fr': 'French',
    'de': 'German', 'ar': 'Arabic', 'tr': 'Turkish', 'zh': 'Chinese',
    'ja': 'Japanese', 'ko': 'Korean', 'ru': 'Russian', 'it': 'Italian'
  };

  function getLangName(code) {
    return langMap[code] || code.toUpperCase();
  }

  function formatTime(totalSeconds) {
    if (totalSeconds === 0) return '0m';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`; // Hide seconds if over 1 min
    return `${s}s`;
  }

  function renderStats(daysStr) {
    const now = new Date();
    const isAll = daysStr === 'all';
    const daysNum = isAll ? 365 : parseInt(daysStr);
    const cutoff = isAll ? 0 : now.getTime() - (daysNum * 24 * 60 * 60 * 1000);

    // Update labels
    timeLabelEl.textContent = isAll ? 'across recorded history' : `across the last ${daysNum} days`;
    patternsTimeLabel.textContent = isAll ? 'All time' : `${daysNum} days`;

    // Filter valid sessions in time range
    const validSessions = allSessions.filter(s => s && typeof s.startTime === 'number');
    const filtered = validSessions.filter(s => s.startTime >= cutoff);

    let totalSec = 0;
    const activeDaysSet = new Set();
    const langCounts = {};
    const domainCounts = {};
    const hourCounts = new Array(24).fill(0);
    const dayCounts = {}; // For heatmap: 'YYYY-MM-DD' -> seconds

    filtered.forEach(session => {
      const sec = session.durationSec || 0;
      totalSec += sec;

      const d = new Date(session.startTime);
      const dateStr = d.toISOString().split('T')[0];
      
      activeDaysSet.add(dateStr);
      dayCounts[dateStr] = (dayCounts[dateStr] || 0) + sec;

      const hour = d.getHours();
      hourCounts[hour] += sec;

      const l = session.lang || 'unknown';
      langCounts[l] = (langCounts[l] || 0) + sec;

      const dom = session.domain || 'unknown';
      domainCounts[dom] = (domainCounts[dom] || 0) + sec;
    });

    // Top metrics
    totalTimeEl.textContent = formatTime(totalSec);
    totalSessionsEl.innerHTML = `<strong class="serif">${filtered.length}</strong> session${filtered.length !== 1 ? 's' : ''}`;
    activeDaysEl.innerHTML = `<strong class="serif">${activeDaysSet.size}</strong> active day${activeDaysSet.size !== 1 ? 's' : ''}`;
    const distinctLangs = Object.keys(langCounts).length;
    totalLanguagesEl.innerHTML = `<strong class="serif">${distinctLangs}</strong> language${distinctLangs !== 1 ? 's' : ''}`;

    renderHeatmap(validSessions); // Heatmap always shows the whole year up to today
    renderListeningHours(hourCounts);
    renderLineBars(languagesListEl, langCounts, (key) => getLangName(key));
    renderLineBars(domainsListEl, domainCounts, (key) => key);
  }

  function renderHeatmap(validSessions) {
    // Generate map of all days
    const dayCounts = {};
    validSessions.forEach(s => {
      const d = new Date(s.startTime);
      // use local date string
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      dayCounts[dateStr] = (dayCounts[dateStr] || 0) + (s.durationSec || 0);
    });

    heatmapGrid.innerHTML = '';
    heatmapMonths.innerHTML = '';

    const today = new Date();
    // 52 weeks * 7 days = 364 days.
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 363);
    
    // Align to Sunday start
    // If we want exact 52 cols, we just draw 364 boxes top to bottom, left to right.
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let currentMonth = -1;

    for (let i = 0; i < 364; i++) {
      const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      
      const sec = dayCounts[dateStr] || 0;
      let level = 0;
      if (sec > 0) level = 1;
      if (sec > 600) level = 2; // > 10m
      if (sec > 1800) level = 3; // > 30m
      if (sec > 3600) level = 4; // > 1h

      const cell = document.createElement('div');
      cell.className = `heat-cell l-${level}`;
      cell.title = `${dateStr}: ${formatTime(sec)}`;
      heatmapGrid.appendChild(cell);

      // Month labels
      if (d.getDate() === 1 || (i === 0)) {
        if (d.getMonth() !== currentMonth) {
          currentMonth = d.getMonth();
          const colIndex = Math.floor(i / 7);
          const monthSpan = document.createElement('span');
          monthSpan.textContent = monthNames[currentMonth];
          // 13px per column (10px width + 3px gap)
          monthSpan.style.left = `${colIndex * 13}px`;
          heatmapMonths.appendChild(monthSpan);
        }
      }
    }
  }

  function renderListeningHours(hourCounts) {
    listeningChart.innerHTML = '';
    
    const maxSec = Math.max(...hourCounts, 1); // Avoid div by zero
    let peakHour = 0;
    let peakSec = 0;

    for (let i = 0; i < 24; i++) {
      const sec = hourCounts[i];
      if (sec > peakSec) {
        peakSec = sec;
        peakHour = i;
      }

      const percent = (sec / maxSec) * 100;
      
      const wrap = document.createElement('div');
      wrap.className = 'listen-bar-wrap';
      
      const bar = document.createElement('div');
      bar.className = 'listen-bar' + (sec === 0 ? ' empty' : '');
      bar.style.height = `${Math.max(2, percent)}%`;
      bar.title = `${String(i).padStart(2,'0')}:00 - ${formatTime(sec)}`;
      
      wrap.appendChild(bar);
      listeningChart.appendChild(wrap);
    }

    // Format GMT string
    const offsetMin = -new Date().getTimezoneOffset();
    const sign = offsetMin >= 0 ? '+' : '-';
    const absMin = Math.abs(offsetMin);
    const h = Math.floor(absMin / 60);
    const m = absMin % 60;
    const gmtStr = `GMT${sign}${h}:${String(m).padStart(2,'0')}`;

    const peakHourStr = `${String(peakHour).padStart(2,'0')}:00`;
    
    if (peakSec === 0) {
      listeningFooter.innerHTML = `Not enough data yet`;
    } else {
      listeningFooter.innerHTML = `Most active around <strong>${peakHourStr} ${gmtStr}</strong>`;
    }
  }

  function renderLineBars(container, countsDict, nameFormatter) {
    container.innerHTML = '';
    
    const sorted = Object.entries(countsDict).sort((a, b) => b[1] - a[1]);
    
    if (sorted.length === 0) {
      container.innerHTML = '<div class="empty-state">No data yet</div>';
      return;
    }

    const maxSec = sorted.length > 0 ? sorted[0][1] : 1;

    sorted.slice(0, 5).forEach(([key, sec]) => {
      const percentage = Math.max(2, Math.round((sec / maxSec) * 100));
      
      const row = document.createElement('div');
      row.className = 'line-row';
      
      row.innerHTML = `
        <div class="line-header">
          <span class="line-name">${nameFormatter(key)}</span>
          <span class="line-val">${formatTime(sec)}</span>
        </div>
        <div class="line-track">
          <div class="line-fill" style="width: ${percentage}%"></div>
        </div>
      `;
      container.appendChild(row);
    });
  }

  // Handle filters
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderStats(e.target.dataset.days);
    });
  });

  // Load data
  chrome.storage.local.get(['lad_sessions'], (res) => {
    if (res.lad_sessions && Array.isArray(res.lad_sessions)) {
      allSessions = res.lad_sessions;
    }
    renderStats('all');
  });
});
