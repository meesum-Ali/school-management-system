import { AuthProvider } from '@/contexts/AuthContext';
import ThemeProvider from '@/providers/ThemeProvider';
import { HelmetProvider } from 'react-helmet-async';
import { AppRouter } from './router'; // Import the AppRouter

// The global CSS and font imports are now in main.tsx

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          {/* AppRouter now handles all routing logic */}
          <AppRouter />
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
