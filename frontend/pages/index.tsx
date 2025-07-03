import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Changed import

const Home = () => {
  const navigate = useNavigate(); // Changed hook

  useEffect(() => {
    // Redirect to login page by default
    navigate('/login', { replace: true }); // Changed method, added replace: true
  }, [navigate]);

  return null; // This page will immediately redirect
};

export default Home;
