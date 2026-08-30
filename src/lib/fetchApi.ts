export async function fetchApi(
  endpoint: string,
  options: RequestInit = {},
) {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

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

  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  // Handle 401 globally
  if (res.status === 401 && typeof window !== 'undefined') {
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
    
    if (typeof data === "object" && data !== null) {
      if (data.message) {
        message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
      } else if (data.error) {
        message = data.error;
      }
    }

    console.error(`API Error [${endpoint}]:`, message);
    throw new Error(message);
  }

  return data;
}
