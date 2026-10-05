import { usePublicClubQuery } from '@/lib/public-club/api';
import type { SocialLink } from './social-links';
import { buildSocialLinks } from './social-links';

export const useSocialLinks = (): SocialLink[] => {
  const { data } = usePublicClubQuery();

  return buildSocialLinks(data);
};
