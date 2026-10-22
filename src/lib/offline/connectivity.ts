import type { ConnectivityStatus } from './types';
import { getApiBaseUrl } from '@/lib/apiBaseUrl';

/**
 * Phase 11, section 14 — navigator.onLine only tells you the device has
 * *a* network interface that thinks it's up; a phone can report "online"
 * on a wifi network with no real internet, or with wifi reachable but the
 * RFC backend itself down. This distinguishes:
 *
 *   offline              — navigator says no network at all
 *   backend-unreachable  — network exists, but GET /health didn't answer
 *   online               — /health answered
 *
 * The Sync Center and the header badge only need "can we reach RFC right
 * now", which is `online` vs everything else — but the distinction is
 * kept because "your wifi is fine, RFC just can't be reached" and "you
 * have no network" are different things to tell a person standing in a
 * mandi with patchy signal.
 */

const HEALTH_PATH = '/health';
const PROBE_TIMEOUT_MS = 4000;
const POLL_INTERVAL_MS = 20000;

function healthUrl(): string {
  return `${getApiBaseUrl()}${HEALTH_PATH}`;
}

async function probeBackend(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    const res = await fetch(healthUrl(), { method: 'GET', cache: 'no-store', signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

type Listener = (status: ConnectivityStatus) => void;

class ConnectivityMonitor {
  private status: ConnectivityStatus = 'offline';
  private listeners = new Set<Listener>();
  private pollHandle: ReturnType<typeof setInterval> | null = null;
  private started = false;

  private setStatus(next: ConnectivityStatus) {
    if (next === this.status) return;
    this.status = next;
    this.listeners.forEach((l) => l(next));
  }

  getStatus(): ConnectivityStatus {
    return this.status;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Ask right now instead of waiting for the next poll tick — used before a manual "Sync now". */
  async checkNow(): Promise<ConnectivityStatus> {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.setStatus('offline');
      return 'offline';
    }
    const reachable = await probeBackend();
    this.setStatus(reachable ? 'online' : 'backend-unreachable');
    return this.status;
  }

  start() {
    if (this.started || typeof window === 'undefined') return;
    this.started = true;

    window.addEventListener('online', () => void this.checkNow());
    window.addEventListener('offline', () => this.setStatus('offline'));

    void this.checkNow();
    this.pollHandle = setInterval(() => void this.checkNow(), POLL_INTERVAL_MS);
  }

  stop() {
    if (this.pollHandle) clearInterval(this.pollHandle);
    this.pollHandle = null;
    this.started = false;
  }
}

/** One monitor per browser tab — every consumer (badge, sync engine, sync center) shares the same poll instead of each running its own. */
export const connectivityMonitor = new ConnectivityMonitor();
