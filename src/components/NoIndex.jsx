import { useEffect } from 'react';

// Rendered by "not found" views. A static host answers every unknown URL with
// index.html and a 200, so search engines cannot tell a missing page from a
// real one and may index the error screen. This adds <meta name="robots"
// content="noindex"> while the view is shown, and removes it on the way out so
// it never sticks to the next page. (The proper fix is a real 404 status from
// the server — listed in the backend requirements.)
const NoIndex = () => {
  useEffect(() => {
    const el = document.createElement('meta');
    el.setAttribute('name', 'robots');
    el.setAttribute('content', 'noindex');
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
};

export default NoIndex;
