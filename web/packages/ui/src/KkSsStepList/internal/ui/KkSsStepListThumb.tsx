import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { KkPhoto } from '../../../KkPhoto';
import { kkTokens } from '../../../tokens';

interface KkSsStepListThumbProps {
  poster: string | null;
}

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const KkSsStepListThumb: FC<KkSsStepListThumbProps> = ({ poster }) => {
  const image = poster === null ? null : { src: poster };

  return (
    <Stack
      aria-hidden
      sx={(theme) => ({
        flexShrink: 0,
        width: '3.5rem',
        '@container kk-ss-step (max-width: 24rem)': { display: 'none' },
        aspectRatio: '16 / 9',
        borderRadius: `${kkTokens.radius.bar * 2}px`,
        overflow: 'clip',
        backgroundColor: palette(theme).action.hover,
      })}
    >
      <KkPhoto alt="" image={image} fill aspectRatio="16 / 9" size="thumb" />
    </Stack>
  );
};
