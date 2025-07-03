interface Config {
  apiUrl: string
  appVersion: string
  enableFeatureX: boolean
}

const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) {
  console.error("FATAL ERROR: VITE_API_URL is not set. API calls will fail.");
  // In a server-side environment or build process, you might throw an error:
  // throw new Error("FATAL ERROR: VITE_API_URL is not set.");
}

const config: Config = {
  apiUrl: apiUrl || '', // Keep fallback for now to prevent immediate crash, error is logged
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  enableFeatureX: import.meta.env.VITE_ENABLE_FEATURE_X === 'true',
}

export default config
