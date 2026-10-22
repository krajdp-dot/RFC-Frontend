export async function fetchApi(
  endpoint: string,
  options: RequestInit = {},
  // Phase 11: the sync engine runs in the background, possibly while the
  // person is mid-task on a completely different screen — see sections
  // 29-30. If a queued mutation's session turns out to be expired or
  // revoked, forcibly navigating them to /login out of nowhere would be
  // worse than the problem it's solving. redirectOn401: false lets that
  // one caller see the 401 as a normal thrown error (classified AUTH,
  // surfaced in the Sync Center) instead of triggering the page redirect
  // every other caller in the app still gets by default.
  config: { redirectOn401?: boolean } = {},
) {
  const redirectOn401 = config.redirectOn401 ?? true;
  // Preview deployments may not inherit the Production-only Vercel env var.
  // Keep RFC preview builds pointed at the same deployed API unless explicitly overridden.
  const baseUrl = (
    process.env.NEXT_PUBLIC_API_URL || "https://rfc-backend-rkic.onrender.com"
  ).replace(/\/$/, "");

  const url = baseUrl + (endpoint.startsWith("/api/v1") ? "" : "/api/v1") + endpoint;

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body && typeof options.body === 'string') {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Accept", "application/json");

  // Get token from cookie (handles both RSC and CSR, though for CSR we can also use document.cookie, but Next.js fetch in CSR might not need this if we set credentials? No, we must send Bearer)
  let token: string | undefined = undefined;
  
  if (typeof window !== "undefined") {
    // Client-side
    const match = document.cookie.match(new RegExp('(^| )' + 'token' + '=([^;]+)'));
    if (match) token = match[2];
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Phase 11: a hung request on a weak mandi connection should fail fast
  // enough for the offline layer to queue it, not spin forever. 20s is
  // generous for a slow connection but short enough that "saved offline"
  // shows up promptly instead of the button just sitting on "Creating...".
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
      signal: options.signal ?? controller.signal,
    });
  } catch (networkErr) {
    // fetch() itself rejecting (not a non-2xx response) means the request
    // never reached the server at all: no connectivity, DNS failure, the
    // backend is down, or our own timeout above fired. This is exactly
    // the case the offline queue exists for, so it gets a distinct,
    // reliable marker instead of forcing every caller to guess from a
    // generic TypeError message.
    const err = new Error(
      "Couldn't reach RFC. Check your connection and try again.",
    ) as Error & { code?: string; isNetworkError?: boolean };
    err.code = "NETWORK_ERROR";
    err.isNetworkError = true;
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  // Handle 401 globally
  if (res.status === 401 && typeof window !== 'undefined' && redirectOn401) {
    // Clear token
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const contentType = res.headers.get("content-type") || "";

  let data;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    let message = `API Error: ${res.status}`;
    let code: string | undefined;
    let requiredPermission: string | undefined;

    if (typeof data === "object" && data !== null) {
      // Real shape from the backend's global exception filter:
      // { success: false, error: { code, message, details, requestId } }
      if (data.error && typeof data.error === "object") {
        message = data.error.message || message;
        code = data.error.code;
        requiredPermission = data.error.requiredPermission || data.error.details?.requiredPermission;
      } else if (data.message) {
        message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
      } else if (typeof data.error === "string") {
        message = data.error;
      }
    }

    // Phase 10: a 403 is a permission answer, not a broken session — it
    // must never clear the token or bounce to /login the way a 401 does.
    // The UI hides most of these actions already, so reaching here means
    // either a direct URL or a role that changed mid-session; say which
    // in plain words rather than surfacing "API Error: 403".
    if (res.status === 403 && (code === 'INSUFFICIENT_PERMISSION' || !code)) {
      code = code || 'INSUFFICIENT_PERMISSION';
      message = 'Your role doesn\'t allow this. Ask an owner if you need access.';
    }

    console.error(`API Error [${endpoint}]:`, message);
    const err = new Error(message) as Error & { code?: string; status?: number; requiredPermission?: string };
    if (code) err.code = code;
    err.status = res.status;
    if (requiredPermission) err.requiredPermission = requiredPermission;
    throw err;
  }

  return data;
}
