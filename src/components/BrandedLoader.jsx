// Loading state while a page's code downloads — the company logo breathing
// gently, not a generic spinner. Uses the 96px copy in /public (4 KB): it is
// shown at 56px, and this screen exists precisely because something else is
// still downloading, so it should not add a 78 KB image to the wait.
const BrandedLoader = () => (
  <div className="min-h-screen bg-[#050810] flex items-center justify-center">
    <div className="relative flex items-center justify-center">
      <span aria-hidden="true" className="absolute w-24 h-24 rounded-full bg-blue-500/15 animate-ping" />
      <span aria-hidden="true" className="absolute w-20 h-20 rounded-full bg-blue-500/10 blur-xl" />
      <img
        src="/logo-96.png"
        alt="كودلانكو"
        width="56"
        height="56"
        decoding="async"
        className="relative w-14 h-14 object-contain animate-pulse"
      />
    </div>
  </div>
);

export default BrandedLoader;
