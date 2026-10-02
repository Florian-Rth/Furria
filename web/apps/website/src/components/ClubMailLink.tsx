import type { LinkProps } from '@mui/material/Link';
import Link from '@mui/material/Link';
import type { FC } from 'react';
import { buildMailHref } from '@/lib/public-club/club-facts';
import { useClubEmail } from '@/lib/public-club/use-club-email';

type ClubMailLinkProps = Omit<LinkProps, 'href' | 'children'>;

export const ClubMailLink: FC<ClubMailLinkProps> = (linkProps) => {
  const email = useClubEmail();

  if (email === null) {
    return null;
  }

  return (
    <Link {...linkProps} href={buildMailHref(email)}>
      {email}
    </Link>
  );
};
