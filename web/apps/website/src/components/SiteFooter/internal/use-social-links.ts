import { publicClub } from '@/lib/public-club/api';
import { readySourceData } from '@/lib/public-resource/public-source';
import type { SocialLink } from './social-links';
import { buildSocialLinks } from './social-links';

export const useSocialLinks = (): SocialLink[] => {
  const data = readySourceData(publicClub.useSource());

  return buildSocialLinks(data);
};
