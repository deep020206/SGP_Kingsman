import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../../api/axios';
import { useDarkMode } from './DarkModeContext';
import NavBar from './NavBar';
import HeroSection from './HeroSection';
import CategoryGrid from './CategoryGrid';
import MenuItems from './MenuItems';
import HowItWorks from './HowItWorks';
import AboutSection from './AboutSection';
import Footer from './Footer';

const LandingPage = ({ onLoginClick, onSignupClick, onAddToCart: externalAddToCart }) => {
  const { isDarkMode } = useDarkMode();
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('home');

  // Fetch real menu items from backend
  useEffect(() => {
    let active = true;
    const fetchMenuItems = async (retryCount = 0) => {
      try {
        setLoading(true);
        if (retryCount === 0) setError(''); // Only clear error on first attempt
        
        const response = await api.get('/menu');
        if (!active) return;
        
        if (response.data && Array.isArray(response.data)) {
          setFoodItems(response.data);
          setError(''); // Clear any previous errors on success
        } else {
          console.warn('Invalid menu data format:', response.data);
          setFoodItems([]);
        }
      } catch (err) {
        if (!active) return;
        console.error('Failed to fetch menu:', err);
        
        // Enhanced error handling
        let errorMessage = 'Failed to load menu items';
        if (err.isNetworkError) {
          errorMessage = 'Network connection issue. Please check your internet connection.';
        } else if (err.response?.status === 503) {
          errorMessage = 'Database connection issue. Please try again in a moment.';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        
        setError(errorMessage);
        setFoodItems([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchMenuItems();
    return () => { active = false; };
  }, []);



  // Section refs for smooth scroll navigation
  const heroRef = useRef(null);
  const menuRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null); // placeholder (reuse footer)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const sections = {
        home: heroRef,
        menu: menuRef,
        about: aboutRef,
        contact: contactRef
      };
      
      // Find the current section based on scroll position
      for (const [name, ref] of Object.entries(sections)) {
        if (!ref.current) continue;
        const elem = ref.current;
        const rect = elem.getBoundingClientRect();
        // If element is mostly in view or we're near the top for 'home'
        if (
          (name === 'home' && scrollY < 100) ||
          (rect.top <= 100 && rect.bottom >= 300)
        ) {
          setActiveSection(name);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = useCallback((section) => {
    const map = { home: heroRef, menu: menuRef, about: aboutRef, contact: contactRef };
    const target = map[section]?.current;
    if (target) {
      setActiveSection(section); // Update immediately for faster UI feedback
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const onAddToCart = useCallback((item)=>{
    if (typeof externalAddToCart === 'function') {
      externalAddToCart(item);
      return;
    }
    console.log('Add to cart (no external handler)', item);
  }, [externalAddToCart]);

  const pageProps = useMemo(()=>({ isDarkMode }), [isDarkMode]);

  return (
    <div className={isDarkMode? 'dark bg-gray-900 text-gray-100':'bg-white text-gray-900'}>
  <NavBar isDarkMode={isDarkMode} handleNavigation={handleNavigation} activeSection={activeSection} onLoginClick={onLoginClick} onSignupClick={onSignupClick} />
  <div ref={heroRef}><HeroSection isDarkMode={isDarkMode} /></div>
  <div ref={menuRef}><CategoryGrid isDarkMode={isDarkMode} /></div>
  <div><MenuItems {...pageProps} loading={loading} error={error} foodItems={foodItems} onAddToCart={onAddToCart} /></div>
  <div><HowItWorks isDarkMode={isDarkMode} /></div>
  <div ref={aboutRef}><AboutSection isDarkMode={isDarkMode} /></div>
  <div ref={contactRef}><Footer isDarkMode={isDarkMode} /></div>
    </div>
  );
};

export default LandingPage;
