// A motion-graphics project stores a video link (YouTube or Vimeo), never a
// video file: the upload endpoint takes images up to 2 MB, and serving video
// from shared hosting would be slow and expensive.
//
// Only links that parse to a known provider and a well-formed id are accepted,
// and the embed URL is rebuilt from that id — the stored string is never used
// as an iframe src, so a crafted link cannot frame an arbitrary page.

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d{6,12}$/;

export const parseVideo = (raw) => {
  const value = String(raw ?? '').trim();
  if (!value) return null;
  let u;
  try { u = new URL(value); } catch { return null; }
  if (u.protocol !== 'https:') return null;
  const host = u.hostname.replace(/^(www\.|m\.)/, '');
  const parts = u.pathname.split('/').filter(Boolean);

  let yt = null;
  if (host === 'youtu.be') yt = parts[0];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (parts[0] === 'watch') yt = u.searchParams.get('v');
    else if (['shorts', 'embed', 'live', 'v'].includes(parts[0])) yt = parts[1];
  }
  if (yt && YT_ID.test(yt)) {
    return {
      provider: 'youtube',
      id: yt,
      vertical: parts[0] === 'shorts',
      // youtube-nocookie: no YouTube cookies until the visitor presses play.
      embed: `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
      thumb: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
      watch: `https://www.youtube.com/watch?v=${yt}`,
    };
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = parts.find(p => VIMEO_ID.test(p));
    if (id) {
      return {
        provider: 'vimeo',
        id,
        vertical: false,
        embed: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`,
        thumb: '', // Vimeo needs an API call for this; the project cover is used instead.
        watch: `https://vimeo.com/${id}`,
      };
    }
  }
  return null;
};
