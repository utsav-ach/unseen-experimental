export const env = {
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "",
  BACKEND_PASSWORD: process.env.NEXT_PUBLIC_BACKEND_PASSWORD ?? "",
  BACKEND_SERVICE_KEY: process.env.BACKEND_SERVICE_KEY ?? "",
} as const;

export function assertPublicEnv() {
  if (!env.BACKEND_URL || !env.BACKEND_PASSWORD) {
    throw new Error(
      "Missing required public env vars: NEXT_PUBLIC_BACKEND_URL, NEXT_PUBLIC_BACKEND_PASSWORD",
    );
  }
}

export function assertServiceEnv() {
  if (!env.BACKEND_SERVICE_KEY) {
    throw new Error("Missing required server env var: BACKEND_SERVICE_KEY");
  }
}
