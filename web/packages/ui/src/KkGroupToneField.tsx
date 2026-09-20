import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import type { KkGroupTone } from './internal/group-tone';
import { groupToneFieldPaint } from './internal/group-tone';
import { lineClamp } from './internal/line-clamp';
import type { KkScheme } from './internal/scheme-paint';
import { applyScheme } from './internal/scheme-paint';
import { watermarkOpacityScheme } from './internal/watermark-paint';
import { KkBroomMark } from './KkBroomMark';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const NAME_SIZE = 'clamp(1.25rem, 11cqw, 2.75rem)';
const NAME_LINE_HEIGHT = 0.94;
const NAME_LINES = 3;
const MARK_SIZE = 170;
const MARK_PLACEMENT = { bottom: '-40%', right: '-12%' };
const MARK_TILT = 'rotate(-14deg)';
const INK_INSET = { px: { xs: 1.75, desktop: 2.25 }, py: { xs: 1.5, desktop: 1.75 } };
const FILL_HEIGHT = { height: '100%' } as const;

const scrimScheme: KkScheme = {
  light: { backgroundImage: kkTokens.color.light.photoScrim },
  dark: { backgroundImage: kkTokens.color.dark.photoScrim },
};

interface KkGroupToneFieldProps {
  tone: KkGroupTone;
  name: string;
  eyebrow?: ReactNode;
  aspectRatio?: string;
  sx?: KkSx;
}

export const KkGroupToneField: FC<KkGroupToneFieldProps> = ({
  tone,
  name,
  eyebrow,
  aspectRatio,
  sx,
}) => {
  const sizing = aspectRatio === undefined ? FILL_HEIGHT : { aspectRatio };

  return (
    <Box
      data-kk-group-tone-field
      sx={[
        (theme) => ({
          position: 'relative',
          isolation: 'isolate',
          overflow: 'hidden',
          containerType: 'inline-size',
          width: '100%',
          minWidth: 0,
          ...sizing,
          ...groupToneFieldPaint(theme, tone),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        aria-hidden
        data-kk-group-tone-field-watermark
        sx={(theme) => ({
          position: 'absolute',
          ...MARK_PLACEMENT,
          zIndex: 0,
          transform: MARK_TILT,
          color: 'inherit',
          pointerEvents: 'none',
          ...applyScheme(theme, watermarkOpacityScheme),
        })}
      >
        <KkBroomMark size={MARK_SIZE} />
      </Box>
      <Box
        aria-hidden
        data-kk-group-tone-field-scrim
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
          ...INK_INSET,
        }}
      >
        {eyebrow}
        <Box
          component="p"
          data-kk-group-tone-field-name
          sx={{
            m: 0,
            color: 'inherit',
            fontFamily: kkTokens.font.display,
            fontWeight: kkTokens.font.displayWeight,
            fontSize: NAME_SIZE,
            letterSpacing: kkTokens.type.tracking.display,
            lineHeight: NAME_LINE_HEIGHT,
            textShadow: kkTokens.overlay.textShadow,
            overflowWrap: 'anywhere',
            ...lineClamp(NAME_LINES),
          }}
        >
          {name}
        </Box>
      </Stack>
    </Box>
  );
};
