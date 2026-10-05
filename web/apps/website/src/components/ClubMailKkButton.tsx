import type { KkSx } from '@furria/ui';
import { KkButton } from '@furria/ui';
import type { FC, PropsWithChildren } from 'react';
import { buildMailHref } from '@/lib/public-club/club-facts';
import { useClubEmail } from '@/lib/public-club/use-club-email';

interface ClubMailKkButtonProps extends PropsWithChildren {
  variant?: 'contained' | 'outlined' | 'text';
  sx?: KkSx;
}

export const ClubMailKkButton: FC<ClubMailKkButtonProps> = ({ children, variant, sx }) => {
  const email = useClubEmail();

  if (email === null) {
    return null;
  }

  return (
    <KkButton variant={variant} href={buildMailHref(email)} sx={sx}>
      {children}
    </KkButton>
  );
};
