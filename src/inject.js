// inject.js — runs in PAGE context (not extension context)
// Must be injected via a <script> tag to intercept fetch before React captures it

(function () {
  'use strict';

  if (window.__leetpush_injected) return;
  window.__leetpush_injected = true;

  let lastSubmissionId = null;
  let pollTimer = null;
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const request = args[0];
    const url = typeof request === 'string' ? request
              : (request instanceof Request ? request.url : String(request));

    const response = await originalFetch.apply(this, args);

    try {
      // Catch submit POST — LeetCode posts to /problems/<slug>/submit/
      if (/\/problems\/[^/]+\/submit\//.test(url)) {
        const clone = response.clone();
        clone.json().then(data => {
          const subId = data?.submission_id || data?.submissionId;
          if (subId && String(subId) !== String(lastSubmissionId)) {
            console.log('[LeetPush] Submit detected! ID:', subId);
            lastSubmissionId = String(subId);
            // Tell content script via custom event
            window.dispatchEvent(new CustomEvent('__leetpush_submission', {
              detail: { submissionId: String(subId) }
            }));
          }
        }).catch(() => {});
      }

      // Catch check response
      if (/\/submissions\/detail\/(\d+)\/check/.test(url)) {
        const clone = response.clone();
        clone.json().then(data => {
          if (data?.state === 'SUCCESS' && data?.status_msg === 'Accepted') {
            const subId = url.match(/\/detail\/(\d+)\/check/)?.[1];
            console.log('[LeetPush] ✅ Accepted via check intercept! ID:', subId);
            window.dispatchEvent(new CustomEvent('__leetpush_accepted', {
              detail: { ...data, submission_id: subId }
            }));
          }
        }).catch(() => {});
      }
    } catch {}

    return response;
  };

  console.log('[LeetPush] Page-level fetch interceptor installed');
})();