import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { HeroActions } from './internal/HeroActions';
import { HeroEyebrow } from './internal/HeroEyebrow';
import { HeroHeadline } from './internal/HeroHeadline';
import { HeroIntro } from './internal/HeroIntro';
import { HeroStatRow } from './internal/HeroStatRow';

export const HeroTextColumn: FC = () => (
  <Stack sx={{ alignItems: 'flex-start', gap: 3, maxWidth: 'sm' }}>
    <HeroEyebrow />
    <HeroHeadline />
    <HeroIntro />
    <HeroActions />
    <HeroStatRow />
  </Stack>
);
