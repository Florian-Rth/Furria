import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkGroupTone } from './internal/group-tone';
import { groupToneFieldPaint } from './internal/group-tone';
import { applyScheme } from './internal/scheme-paint';
import { watermarkOpacityScheme } from './internal/watermark-paint';
import { KkBroomMark } from './KkBroomMark';
import type { KkSx } from './kk-sx';

const MARK_SHARE = '58%';
const MARK_PLACEMENT = { bottom: '-22%', right: '-10%' };
const MARK_TILT = 'rotate(-14deg)';
const MARK_VIEWBOX_SIZE = 100;
const FILL_HEIGHT = { height: '100%' } as const;

interface KkVacancyFieldProps {
  tone: KkGroupTone;
  aspectRatio?: string;
  sx?: KkSx;
}

export const KkVacancyField: FC<KkVacancyFieldProps> = ({ tone, aspectRatio, sx }) => {
  const sizing = aspectRatio === undefined ? FILL_HEIGHT : { aspectRatio };

  return (
    <Box
      aria-hidden
      data-kk-vacancy-field={tone}
      sx={[
        (theme) => ({
          position: 'relative',
          isolation: 'isolate',
          overflow: 'hidden',
          width: '100%',
          minWidth: 0,
          ...sizing,
          ...groupToneFieldPaint(theme, tone),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={(theme) => ({
          position: 'absolute',
          ...MARK_PLACEMENT,
          width: MARK_SHARE,
          transform: MARK_TILT,
          color: 'inherit',
          pointerEvents: 'none',
          ...applyScheme(theme, watermarkOpacityScheme),
        })}
      >
        <KkBroomMark size={MARK_VIEWBOX_SIZE} sx={{ width: '100%', height: 'auto' }} />
      </Box>
    </Box>
  );
};
