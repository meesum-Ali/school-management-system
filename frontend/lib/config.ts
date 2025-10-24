interface Config {
  apiUrl: string
  appVersion: string
  enableFeatureX: boolean
}

// Next.js uses NEXT_PUBLIC_ prefix for client-side environment variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL
if (!apiUrl) {
  console.error('FATAL ERROR: NEXT_PUBLIC_API_URL is not set. API calls will fail.')
  // In a server-side environment or build process, you might throw an error:
  // throw new Error("FATAL ERROR: NEXT_PUBLIC_API_URL is not set.");
}

const config: Config = {
  apiUrl: apiUrl || '', // Keep fallback for now to prevent immediate crash, error is logged
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  enableFeatureX: process.env.NEXT_PUBLIC_ENABLE_FEATURE_X === 'true',
}

export default config
