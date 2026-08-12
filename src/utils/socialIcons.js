import { Link2 } from 'lucide-react';
import {
  SiFacebook, SiX, SiInstagram, SiGithub, SiYoutube,
  SiTiktok, SiWhatsapp, SiTelegram, SiDiscord,
} from 'react-icons/si';
import { FaLinkedinIn } from 'react-icons/fa6';

// react-icons/si (Simple Icons) for brand marks — lucide-react ships no brand
// icons. LinkedIn is the one exception: Simple Icons dropped it, so it comes
// from Font Awesome instead. `custom` falls back to a generic link glyph.
export const SOCIAL_ICONS = {
  facebook:  SiFacebook,
  twitter:   SiX,
  instagram: SiInstagram,
  linkedin:  FaLinkedinIn,
  github:    SiGithub,
  youtube:   SiYoutube,
  tiktok:    SiTiktok,
  whatsapp:  SiWhatsapp,
  telegram:  SiTelegram,
  discord:   SiDiscord,
  custom:    Link2,
};

export const getSocialIcon = (platform) => SOCIAL_ICONS[platform] ?? Link2;
