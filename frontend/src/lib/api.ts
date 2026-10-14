
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!configuredApiUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is missing. Check frontend/.env.local."
  );
}

export const API_URL = configuredApiUrl.replace(/\/+$/, "");
