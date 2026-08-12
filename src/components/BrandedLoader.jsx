// Branded loading state — pulsing "CL" mark instead of a generic spinner.
const BrandedLoader = () => (
  <div className="min-h-screen bg-[#050810] flex items-center justify-center">
    <div className="relative flex items-center justify-center">
      <div className="absolute w-16 h-16 rounded-2xl bg-blue-500/20 animate-ping" />
      <svg width="44" height="44" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="relative animate-pulse">
        <rect width="100" height="100" rx="20" fill="#0a0f1e" />
        <text x="50" y="62" fontFamily="JetBrains Mono,monospace" fontSize="42" fontWeight="700" textAnchor="middle" fill="url(#cl-loader-grad)">CL</text>
        <defs>
          <linearGradient id="cl-loader-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
);

export default BrandedLoader;
