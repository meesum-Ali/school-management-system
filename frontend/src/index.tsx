// This file is not used in a Next.js application.
// The entry point for Next.js is the pages/_app.tsx file.
// This file can be safely removed or kept as a redirect.

export default function Home() {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
  return null;
}
