import type { PublicClub } from '@/lib/public-club/schemas';

export type SocialNetwork = 'facebook' | 'instagram';

export interface SocialLink {
  network: SocialNetwork;
  label: string;
  href: string;
}

const linkOf = (network: SocialNetwork, label: string, href: string | null): SocialLink[] =>
  href === null ? [] : [{ network, label, href }];

export const buildSocialLinks = (club: PublicClub | undefined): SocialLink[] =>
  club === undefined
    ? []
    : [
        ...linkOf('facebook', 'FURRIA auf Facebook', club.facebookUrl),
        ...linkOf('instagram', 'FURRIA auf Instagram', club.instagramUrl),
      ];
