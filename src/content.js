// content.js — extension content script
// Injects inject.js into the page context, then listens for custom events

(function () {
  'use strict';

  let pollTimer = null;
  let lastSubmissionId = null;

  // ─── Step 1: Inject page-level script into DOM ────────────────────────────
  function injectScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('src/inject.js');
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
    console.log('[LeetPush] ✅ Content script loaded —', window.location.href);
  }

  injectScript();

  // ─── Step 2: Listen for submission ID from inject.js ─────────────────────
  window.addEventListener('__leetpush_submission', (e) => {
    const { submissionId } = e.detail;
    if (!submissionId || submissionId === lastSubmissionId) return;
    lastSubmissionId = submissionId;
    console.log('[LeetPush] 📨 Got submission ID from page:', submissionId);
    startPolling(submissionId);
  });

  // ─── Step 3: Also listen if inject.js caught an accepted check directly ───
  window.addEventListener('__leetpush_accepted', (e) => {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    onAccepted(e.detail);
  });

  // ─── Poll /check/ until SUCCESS ───────────────────────────────────────────
  function startPolling(submissionId) {
    if (pollTimer) clearInterval(pollTimer);
    let attempts = 0;
    console.log('[LeetPush] ⏳ Polling for result...');

    pollTimer = setInterval(async () => {
      attempts++;
      if (attempts > 30) {
        clearInterval(pollTimer); pollTimer = null;
        console.warn('[LeetPush] ⏰ Polling timed out');
        return;
      }

      try {
        const res = await fetch(
          `https://leetcode.com/submissions/detail/${submissionId}/check/`,
          { credentials: 'include', headers: { 'x-requested-with': 'XMLHttpRequest' } }
        );
        if (!res.ok) return;

        const data = await res.json();
        console.log(`[LeetPush] Poll #${attempts}: state=${data.state} status=${data.status_msg}`);

        if (data.state === 'SUCCESS' || data.state === 'FAILURE') {
          clearInterval(pollTimer); pollTimer = null;
          if (data.status_msg === 'Accepted') {
            onAccepted({ ...data, submission_id: submissionId });
          } else {
            console.log('[LeetPush] ❌ Not accepted:', data.status_msg);
          }
        }
      } catch (e) {
        console.error('[LeetPush] Poll error:', e);
      }
    }, 1500);
  }

  // ─── On accepted: push to GitHub ─────────────────────────────────────────
  async function onAccepted(data) {
    console.log('[LeetPush] ✅ Accepted! Extracting problem info...');
    await sleep(400);

    const problem = getProblemInfo();
    console.log('[LeetPush] Problem:', problem);

    const lang    = normalizeLang(data.lang || data.pretty_lang || '');
    const runtime = data.status_runtime || '0 ms';
    const memory  = data.status_memory  || '0 MB';
    const code    = data.code || getCodeFromEditor() || '# code not captured';

    chrome.storage.local.get(
      ['githubToken', 'githubRepo', 'githubBranch', 'pushCode', 'pushReadme', 'showNotifs'],
      async (config) => {
        console.log('[LeetPush] Config — token:', config.githubToken ? '✅' : '❌', '| repo:', config.githubRepo || '❌');

        if (!config.githubToken || !config.githubRepo) {
          console.error('[LeetPush] ❌ No GitHub credentials. Open extension popup and save settings.');
          return;
        }

        const branch = config.githubBranch || 'main';
        const num    = problem.number ? parseInt(problem.number, 10) : '';
        const folder = num ? `${num}-${problem.slug}` : problem.slug;
        const ext    = langToExt(lang);
        const cmt    = langToComment(lang);
        const results = [];

        // Push solution
        if (config.pushCode !== false) {
          const content = [
            `${cmt} ${problem.title}`,
            `${cmt} Difficulty: ${problem.difficulty}`,
            `${cmt} Runtime: ${runtime}`,
            `${cmt} Memory: ${memory}`,
            `${cmt} https://leetcode.com/problems/${problem.slug}/`,
            '', code
          ].join('\n');

          const r = await pushToGitHub(
            config.githubToken, config.githubRepo, branch,
            `${folder}/solution.${ext}`, content,
            `Time: ${runtime} | Memory: ${memory} - LeetPush`
          );
          results.push(r);
          console.log(`[LeetPush] Code push: ${r.status} ${r.ok ? '✅' : '❌'}`);
        }

        // Push README
        if (config.pushReadme !== false) {
          const num2 = problem.number ? parseInt(problem.number, 10) + '. ' : '';
          const readme = `# ${num2}${problem.title}\n\n${problem.description || '_No description._'}\n\n---\n\n**Difficulty:** ${problem.difficulty}  \n**Runtime:** ${runtime}  \n**Memory:** ${memory}  \n**Link:** [LeetCode](https://leetcode.com/problems/${problem.slug}/)\n`;

          const r = await pushToGitHub(
            config.githubToken, config.githubRepo, branch,
            `${folder}/README.md`, readme,
            `Added README.md file for ${problem.title}`
          );
          results.push(r);
          console.log(`[LeetPush] README push: ${r.status} ${r.ok ? '✅' : '❌'}`);
        }

        const allOk = results.length > 0 && results.every(r => r.ok);

        // Update activity log
        chrome.storage.local.get(['activityLog'], ({ activityLog = [] }) => {
          activityLog.push({
            title: problem.title, slug: problem.slug,
            difficulty: problem.difficulty, lang,
            ts: Date.now(), success: allOk
          });
          if (activityLog.length > 50) activityLog.splice(0, activityLog.length - 50);
          chrome.storage.local.set({ activityLog });
        });

        // Notify background for Chrome notification
        chrome.runtime.sendMessage({
          type: 'SHOW_NOTIFICATION',
          ok: allOk, title: problem.title,
          runtime, repo: config.githubRepo
        });
      }
    );
  }

  // ─── GitHub API ───────────────────────────────────────────────────────────
  async function pushToGitHub(token, repo, branch, path, content, message) {
    const url = `https://api.github.com/repos/${repo}/contents/${path}`;
    const headers = {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
    let sha = null;
    try {
      const ex = await fetch(`${url}?ref=${branch}`, { headers });
      if (ex.ok) sha = (await ex.json()).sha;
    } catch {}
    const body = { message, content: btoa(unescape(encodeURIComponent(content))), branch };
    if (sha) body.sha = sha;
    return fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
  }

  // ─── Extract problem info ─────────────────────────────────────────────────
  function getProblemInfo() {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const problemsIdx = pathParts.indexOf('problems');
    const slug = problemsIdx >= 0 ? pathParts[problemsIdx + 1] : '';

    let rawTitle = '';
    for (const sel of ['a.no-underline.truncate','[data-cy="question-title"]','div.text-title-large a','div[class*="title"] a']) {
      const t = document.querySelector(sel)?.textContent?.trim();
      if (t) { rawTitle = t; break; }
    }
    if (!rawTitle) rawTitle = document.title.replace(/ - LeetCode.*/, '').trim();

    let number = '', cleanTitle = rawTitle || slug;
    const m = rawTitle.match(/^(\d+)\.\s+(.+)/);
    if (m) { number = m[1].padStart(4, '0'); cleanTitle = m[2].trim(); }

    let difficulty = 'Unknown';
    for (const el of document.querySelectorAll('span, div')) {
      const t = el.textContent.trim();
      if (t === 'Easy' || t === 'Medium' || t === 'Hard') { difficulty = t; break; }
    }

    const descEl = document.querySelector('[data-track-load="description_content"]')
                || document.querySelector('div[class*="question-content"]');
    const description = descEl?.innerText?.trim() || '';

    return { slug, number, title: cleanTitle, difficulty, description };
  }

  function getCodeFromEditor() {
    const lines = document.querySelectorAll('.view-lines .view-line');
    return lines.length ? Array.from(lines).map(l => l.innerText).join('\n') : '';
  }

  function normalizeLang(lang) {
    const map = { python3:'python3', python:'python', cpp:'cpp', 'c++':'cpp', java:'java', javascript:'javascript', typescript:'typescript', golang:'go', go:'go', rust:'rust', swift:'swift', kotlin:'kotlin', scala:'scala', ruby:'ruby', php:'php', c:'c', csharp:'csharp', mysql:'mysql', bash:'bash' };
    return map[lang.toLowerCase()] || lang.toLowerCase() || 'unknown';
  }

  function langToExt(lang) {
    const map = { python3:'py', python:'py', cpp:'cpp', java:'java', javascript:'js', typescript:'ts', go:'go', rust:'rs', swift:'swift', kotlin:'kt', c:'c', csharp:'cs', ruby:'rb', scala:'scala', php:'php', mysql:'sql', bash:'sh' };
    return map[lang] || 'txt';
  }

  function langToComment(lang) {
    if (['python3','python','ruby','bash'].includes(lang)) return '#';
    if (['mysql'].includes(lang)) return '--';
    return '//';
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
})();
