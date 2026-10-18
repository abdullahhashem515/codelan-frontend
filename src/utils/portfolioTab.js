// A service card's "see our work" link opens the portfolio on the matching tab.
//
// The portfolio section may not exist yet when the link is pressed — below-fold
// sections mount on approach (components/DeferredSection) — so the request is
// both kept for it to read when it mounts and announced to it if it already
// has.
export const PORTFOLIO_TAB_EVENT = 'codelanco:portfolio-tab';

let pending = null;

export const requestPortfolioTab = (tab) => {
  pending = tab;
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(PORTFOLIO_TAB_EVENT, { detail: tab }));
};

export const takePendingTab = () => {
  const tab = pending;
  pending = null;
  return tab;
};
