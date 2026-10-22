const DEFAULT_API_BASE_URL = "https://rfc-backend-rkic.onrender.com";

/**
 * Return one consistent API origin for API requests and connectivity probes.
 * Vercel branch previews share this project's deployment hostname suffix.
 * Keep those previews pinned to the RFC backend even if a Production-only or
 * stale NEXT_PUBLIC_API_URL value is inherited by the Preview environment.
 */
export function getApiBaseUrl(): string {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";
  const isRfcVercelPreview =
    hostname.startsWith("rfc-frontend-") &&
    hostname.endsWith("-krajdp-4226s-projects.vercel.app");

  const configuredBase = process.env.NEXT_PUBLIC_API_URL?.trim();
  const base = isRfcVercelPreview
    ? DEFAULT_API_BASE_URL
    : configuredBase || DEFAULT_API_BASE_URL;

  // Accept either the origin or an origin accidentally configured with /api/v1.
  // fetchApi adds that prefix itself; /health intentionally lives at the root.
  return base.replace(/\/+$/, "").replace(/\/api\/v1$/i, "");
}
