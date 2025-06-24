import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page by default
    router.push('/login');
  }, [router]);

  return null; // This page will immediately redirect, so no need to render anything
};

export default Home;
