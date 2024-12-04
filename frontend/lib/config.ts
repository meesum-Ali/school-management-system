interface Config {
  apiUrl: string
  appVersion: string
  enableFeatureX: boolean
}

const config: Config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  enableFeatureX: process.env.NEXT_PUBLIC_ENABLE_FEATURE_X === 'true',
}

export default config
