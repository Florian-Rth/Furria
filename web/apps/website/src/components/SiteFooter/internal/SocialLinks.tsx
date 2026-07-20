import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { FacebookIcon } from './FacebookIcon';
import { InstagramIcon } from './InstagramIcon';
import { YoutubeIcon } from './YoutubeIcon';

interface SocialLink {
  label: string;
  href: string;
  icon: ReactNode;
}

const socialLinks: SocialLink[] = [
  { label: 'FURRIA auf Facebook', href: '#', icon: <FacebookIcon /> },
  { label: 'FURRIA auf Instagram', href: '#', icon: <InstagramIcon /> },
  { label: 'FURRIA auf YouTube', href: '#', icon: <YoutubeIcon /> },
];

export const SocialLinks: FC = () => (
  <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
    {socialLinks.map((social) => (
      <IconButton
        key={social.label}
        aria-label={social.label}
        href={social.href}
        sx={{ border: 2, borderColor: 'text.primary', color: 'text.primary' }}
      >
        {social.icon}
      </IconButton>
    ))}
  </Stack>
);
