import type { ButtonProps } from '@mui/material/Button';
import Button from '@mui/material/Button';
import type { FC } from 'react';
import { buildMailHref } from '@/lib/public-club/club-facts';
import { useClubEmail } from '@/lib/public-club/use-club-email';

type ClubMailButtonProps = Omit<ButtonProps, 'href'>;

export const ClubMailButton: FC<ClubMailButtonProps> = ({ children, ...buttonProps }) => {
  const email = useClubEmail();

  if (email === null) {
    return null;
  }

  const label = children ?? email;

  return (
    <Button {...buttonProps} href={buildMailHref(email)}>
      {label}
    </Button>
  );
};
