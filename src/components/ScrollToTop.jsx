import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from './SmoothScrollProvider';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, lenis]);
  return null;
};

export default ScrollToTop;
