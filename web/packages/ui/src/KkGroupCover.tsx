import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import type { KkImageSource } from './image-source';
import type { KkGroupTone } from './internal/group-tone';
import { lineClamp } from './internal/line-clamp';
import { responsiveTypography } from './internal/responsive-typography';
import type { KkScheme } from './internal/scheme-paint';
import { applyScheme } from './internal/scheme-paint';
import { KkPhoto } from './KkPhoto';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const NAME_TYPOGRAPHY = { xs: 'h3', desktop: 'h2' } as const;
const NAME_LINE_HEIGHT = 0.94;
const NAME_LINES = 3;
const INK_INSET = { px: { xs: 1.75, desktop: 2.25 }, py: { xs: 1.5, desktop: 1.75 } };
const FILL_HEIGHT = { height: '100%' } as const;

const scrimScheme: KkScheme = {
  light: { backgroundImage: kkTokens.color.light.photoScrim },
  dark: { backgroundImage: kkTokens.color.dark.photoScrim },
};

interface KkGroupCoverProps {
  tone: KkGroupTone;
  name: string;
  image: KkImageSource | null;
  eyebrow?: ReactNode;
  aspectRatio?: string;
  priority?: boolean;
  sx?: KkSx;
}

export const KkGroupCover: FC<KkGroupCoverProps> = ({
  tone,
  name,
  image,
  eyebrow,
  aspectRatio,
  priority = false,
  sx,
}) => {
  const sizing = aspectRatio === undefined ? FILL_HEIGHT : { aspectRatio };

  return (
    <Box
      data-kk-group-cover
      sx={[
        {
          position: 'relative',
          isolation: 'isolate',
          overflow: 'hidden',
          width: '100%',
          minWidth: 0,
          ...sizing,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkPhoto
        alt=""
        image={image}
        tone={tone}
        priority={priority}
        fill
        sx={{ position: 'absolute', inset: 0, zIndex: 0 }}
      />
      <Box
        aria-hidden
        data-kk-group-cover-scrim
        sx={(theme) => ({
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          ...applyScheme(theme, scrimScheme),
        })}
      />
      <Stack
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          minWidth: 0,
          justifyContent: 'flex-end',
          gap: 0.25,
          color: kkTokens.overlay.onPhotoText,
          ...INK_INSET,
        }}
      >
        {eyebrow}
        <Box
          component="p"
          data-kk-group-cover-name
          sx={(theme) => ({
            m: 0,
            color: 'inherit',
            ...responsiveTypography(theme, NAME_TYPOGRAPHY, {
              letterSpacing: kkTokens.type.tracking.display,
              lineHeight: NAME_LINE_HEIGHT,
            }),
            textShadow: kkTokens.overlay.textShadow,
            overflowWrap: 'break-word',
            ...lineClamp(NAME_LINES),
          })}
        >
          {name}
        </Box>
      </Stack>
    </Box>
  );
};
