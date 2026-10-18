import { lazy } from 'react';

// React.lazy with a recovery path for a code file that fails to download.
//
// Two real causes, both seen on the live site:
//  • The host throttles a burst of requests and answers 429 — a section's file
//    is refused and, with plain lazy(), that section crashes the page.
//  • After a deploy, a browser still holding the previous index.html asks for
//    hashed files that no longer exist.
//
// Retrying the import() itself does not help: browsers remember a failed module
// import and return the same failure without fetching again, until the page
// reloads. So the recovery is one reload, after a short pause so a throttled
// host has time to cool down. A timestamp in sessionStorage stops it looping:
// a second failure within a minute is thrown to the error boundary instead.

const KEY = 'cl_chunk_reload_at';
const WINDOW_MS = 60 * 1000;
const PAUSE_MS = 1500;

export const reloadOnceForChunkError = () => {
  let last = 0;
  try { last = Number(sessionStorage.getItem(KEY)) || 0; } catch { /* storage unavailable */ }
  if (Date.now() - last < WINDOW_MS) return false;
  try { sessionStorage.setItem(KEY, String(Date.now())); } catch { /* storage unavailable */ }
  setTimeout(() => window.location.reload(), PAUSE_MS);
  return true;
};

export const lazyWithRetry = (factory) => lazy(async () => {
  try {
    return await factory();
  } catch (err) {
    // Never resolves: the page is about to reload, and suspending keeps the
    // fallback on screen instead of flashing an error first.
    if (reloadOnceForChunkError()) return new Promise(() => {});
    throw err;
  }
});
