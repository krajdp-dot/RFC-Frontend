export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const url = `${baseUrl}/api/v1${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Mock a user/business ID for now since auth isn't fully wired on the frontend
  // The backend uses a JwtAuthGuard which requires a token, but for now we might need a workaround 
  // or we can pass a dummy token if we create an auth bypass.
  // Actually, if we haven't bypassed auth in backend, we should use a valid token.
  // We'll figure out auth later.

  const res = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    cache: 'no-store' // Always fresh data for dashboard
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`API Error on ${endpoint}:`, res.status, errorText);
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
