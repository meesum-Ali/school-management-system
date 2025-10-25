export const isBrowser = typeof window !== 'undefined'

export function getToken(): string | null {
  if (!isBrowser) return null
  try {
    return window.localStorage.getItem('token')
  } catch {
    return null
  }
}
