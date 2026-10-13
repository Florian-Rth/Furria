import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkImageSource } from './image-source';
import type { KkGroupTone } from './internal/group-tone';
import { KkEventPicture } from './KkEventPicture/KkEventPicture';
import { kkTokens } from './tokens';

export type KkEventCoverSize = 'opener' | 'thumb';

const CANCELLED_THUMB_FILTER = 'grayscale(1)';

const framePaint = (theme: Theme, size: KkEventCoverSize, isCancelled: boolean) => {
  const isThumb = size === 'thumb';
  const isMuted = isThumb && isCancelled;

  return {
    position: 'relative',
    display: 'block',
    width: isThumb ? theme.spacing(8) : '100%',
    minWidth: 0,
    flexShrink: 0,
    aspectRatio: kkTokens.aspectRatio.banner,
    borderRadius: isThumb ? theme.spacing(1) : `${kkTokens.radius.base}px`,
    outline: `${kkTokens.line.hair}px solid`,
    outlineColor: (theme.vars ?? theme).palette.divider,
    outlineOffset: -kkTokens.line.hair,
    filter: isMuted ? CANCELLED_THUMB_FILTER : 'none',
    opacity: isMuted ? kkTokens.opacity.dimmed : 1,
  } as const;
};

interface KkEventCoverProps {
  image: KkImageSource | null;
  tone: KkGroupTone;
  cancelledLabel: string | null;
  size: KkEventCoverSize;
}

export const KkEventCover: FC<KkEventCoverProps> = ({ image, tone, cancelledLabel, size }) => {
  const isCancelled = cancelledLabel !== null;
  const stampLabel = size === 'opener' ? cancelledLabel : null;
  const isDecorative = size === 'thumb' ? true : undefined;

  return (
    <Box
      data-kk-event-cover={size}
      aria-hidden={isDecorative}
      sx={(theme: Theme) => framePaint(theme, size, isCancelled)}
    >
      <KkEventPicture image={image} tone={tone} cancelledLabel={stampLabel} />
    </Box>
  );
};
