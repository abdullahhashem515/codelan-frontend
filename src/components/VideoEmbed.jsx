import { useState } from 'react';
import { Play } from 'lucide-react';
import { useLang } from '../context/LangContext';

// Click-to-play video. Until the visitor presses play this is only an image and
// a button: the YouTube/Vimeo player (≈1 MB of script) is not downloaded, and
// the provider gets no request at all — the privacy policy says as much.
//
// `video` comes from utils/video.parseVideo, so `embed` is always a URL this
// site built from a validated id, never a stored string.
const VideoEmbed = ({ video, poster = '', title = '', className = '' }) => {
  const { lang } = useLang();
  const [playing, setPlaying] = useState(false);
  if (!video) return null;

  const thumb = poster || video.thumb;
  const ratio = video.vertical ? 'aspect-[9/16] max-h-[80vh] mx-auto' : 'aspect-video w-full';

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-black border border-gray-200 dark:border-white/10 ${ratio} ${className}`}>
      {playing ? (
        <iframe
          src={video.embed}
          title={title || (lang === 'ar' ? 'فيديو' : 'Video')}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 w-full h-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={lang === 'ar' ? `تشغيل الفيديو${title ? `: ${title}` : ''}` : `Play video${title ? `: ${title}` : ''}`}
          className="group absolute inset-0 w-full h-full flex items-center justify-center"
        >
          {thumb ? (
            <img src={thumb} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          ) : (
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0158B0]/40 to-[#050810]" />
          )}
          <span aria-hidden="true" className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors" />
          <span aria-hidden="true" className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/95 text-[#0158B0] shadow-[0_10px_40px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-110">
            <Play size={28} className="ml-1" fill="currentColor" /* optical centring: the triangle leans right in both directions */ />
          </span>
        </button>
      )}
    </div>
  );
};

export default VideoEmbed;
