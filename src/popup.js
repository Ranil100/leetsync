// popup.js — LeetPush UI logic

const $ = id => document.getElementById(id);

// ─── Tab switching ──────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    $('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// ─── Toast ───────────────────────────────────────────────────────────────────
function showToast(msg, type = '') {
  const toast = $('toast');
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  setTimeout(() => toast.className = 'toast', 2500);
}

// ─── Load saved settings ─────────────────────────────────────────────────────
chrome.storage.local.get(
  ['githubToken', 'githubRepo', 'githubBranch',
   'pushCode', 'pushReadme', 'showNotifs', 'syncedCount', 'activityLog', 'streakData'],
  (data) => {
    if (data.githubToken) $('githubToken').value = data.githubToken;
    if (data.githubRepo)  $('githubRepo').value  = data.githubRepo;
    $('githubBranch').value = data.githubBranch || 'main';
    $('pushCode').checked   = data.pushCode   !== false;
    $('pushReadme').checked = data.pushReadme !== false;
    $('showNotifs').checked = data.showNotifs !== false;

    updateStatusBadge(data.githubToken && data.githubRepo);
    updateStats(data);
    renderActivity(data.activityLog || []);
    renderLastSynced(data.activityLog || []);
  }
);

function updateStatusBadge(connected) {
  const badge = $('statusBadge');
  if (connected) {
    badge.textContent = 'CONNECTED';
    badge.className = 'status-badge connected';
  } else {
    badge.textContent = 'NOT SET';
    badge.className = 'status-badge disconnected';
  }
}

function updateStats(data) {
  const log = data.activityLog || [];
  const today = new Date().toDateString();
  const todayCount = log.filter(e => new Date(e.ts).toDateString() === today).length;

  $('statTotal').textContent = log.length;
  $('statToday').textContent = todayCount;

  // Simple streak: count consecutive days with at least 1 solve
  const streak = calcStreak(log);
  $('statStreak').textContent = streak;
}

function calcStreak(log) {
  if (!log.length) return 0;
  const days = [...new Set(log.map(e => new Date(e.ts).toDateString()))].reverse();
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const dayStr of days) {
    const d = new Date(dayStr);
    const diff = Math.round((cursor - d) / 86400000);
    if (diff <= 1) {
      streak++;
      cursor = d;
    } else break;
  }
  return streak;
}

function renderLastSynced(log) {
  const container = $('lastSyncedContainer');
  if (!log.length) return;

  const recent = log.slice(-3).reverse();
  container.innerHTML = recent.map(e => `
    <div class="activity-item">
      <div class="activity-dot ${e.success ? 'success' : 'pending'}"></div>
      <div class="activity-text">${e.title}</div>
      <div class="activity-time">${timeAgo(e.ts)}</div>
    </div>
  `).join('');
}

function renderActivity(log) {
  const list = $('activityList');
  if (!log.length) return;

  const recent = [...log].reverse().slice(0, 20);
  list.innerHTML = recent.map(e => `
    <div class="activity-item">
      <div class="activity-dot ${e.success ? 'success' : 'pending'}"></div>
      <div class="activity-text">
        ${e.success ? '✓' : '✗'} ${e.title}
        <span style="color:var(--muted); font-size:10px"> · ${e.lang || ''}</span>
      </div>
      <div class="activity-time">${timeAgo(e.ts)}</div>
    </div>
  `).join('');
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000)  return 'just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return Math.floor(diff / 86400000) + 'd ago';
}

// ─── Save settings ───────────────────────────────────────────────────────────
$('saveSettingsBtn').addEventListener('click', () => {
  const token = $('githubToken').value.trim();
  const repo  = $('githubRepo').value.trim();
  const branch = $('githubBranch').value.trim() || 'main';

  if (!token || !repo) {
    showToast('⚠️ Token and repo are required', 'error');
    return;
  }

  if (!repo.includes('/')) {
    showToast('⚠️ Repo format: username/repo-name', 'error');
    return;
  }

  chrome.storage.local.set({
    githubToken:  token,
    githubRepo:   repo,
    githubBranch: branch,
    pushCode:     $('pushCode').checked,
    pushReadme:   $('pushReadme').checked,
    showNotifs:   $('showNotifs').checked,
  }, () => {
    updateStatusBadge(true);
    showToast('✓ Settings saved!', 'success');
  });
});

// ─── Test connection ─────────────────────────────────────────────────────────
$('testConnectionBtn').addEventListener('click', async () => {
  const token = $('githubToken').value.trim();
  const repo  = $('githubRepo').value.trim();

  if (!token || !repo) {
    showToast('⚠️ Fill in token and repo first', 'error');
    return;
  }

  $('testConnectionBtn').textContent = 'Testing...';
  $('testConnectionBtn').disabled = true;

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      showToast(`✓ Connected to ${data.full_name}`, 'success');
      updateStatusBadge(true);
    } else if (res.status === 404) {
      showToast('✗ Repo not found — check username/repo', 'error');
    } else if (res.status === 401) {
      showToast('✗ Invalid token', 'error');
    } else {
      showToast(`✗ GitHub error: ${res.status}`, 'error');
    }
  } catch (e) {
    showToast('✗ Network error', 'error');
  } finally {
    $('testConnectionBtn').textContent = 'Test Connection';
    $('testConnectionBtn').disabled = false;
  }
});

// ─── Open repo ───────────────────────────────────────────────────────────────
$('openRepoBtn').addEventListener('click', () => {
  chrome.storage.local.get(['githubRepo'], ({ githubRepo }) => {
    if (githubRepo) {
      chrome.tabs.create({ url: `https://github.com/${githubRepo}` });
    } else {
      showToast('⚠️ No repo configured yet', 'error');
    }
  });
});

// ─── Token help link ─────────────────────────────────────────────────────────
$('tokenHelpLink').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://github.com/settings/tokens/new?scopes=repo&description=LeetPush' });
});
