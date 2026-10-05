import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { FacebookIcon } from './FacebookIcon';
import { InstagramIcon } from './InstagramIcon';
import type { SocialNetwork } from './social-links';
import { useSocialLinks } from './use-social-links';

const networkIcons: Record<SocialNetwork, ReactNode> = {
  facebook: <FacebookIcon />,
  instagram: <InstagramIcon />,
};

export const SocialLinks: FC = () => {
  const socialLinks = useSocialLinks();

  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
      {socialLinks.map((social) => (
        <IconButton
          key={social.network}
          aria-label={social.label}
          href={social.href}
          sx={{ border: 2, borderColor: 'text.primary', color: 'text.primary' }}
        >
          {networkIcons[social.network]}
        </IconButton>
      ))}
    </Stack>
  );
};
