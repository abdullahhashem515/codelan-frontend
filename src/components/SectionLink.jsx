import { Link, useLocation } from 'react-router-dom';

// A link to a home-page section (#services, #contact, #home …) that works from
// any page.
//
// On the home page it is a plain in-page anchor, which SmoothScrollProvider
// picks up and scrolls to. Anywhere else — an article, a project — "#services"
// points at nothing on that page, so the header's and footer's links silently
// did nothing there. Off the home page it becomes a router link to "/#section";
// ScrollToTop then scrolls to the section once the home page has rendered it.
const SectionLink = ({ to, children, ...rest }) => {
  const { pathname } = useLocation();
  if (pathname === '/') return <a href={to} {...rest}>{children}</a>;
  return <Link to={to === '#home' ? '/' : `/${to}`} {...rest}>{children}</Link>;
};

export default SectionLink;
