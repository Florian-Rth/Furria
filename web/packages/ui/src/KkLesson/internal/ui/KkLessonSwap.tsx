import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { insetBoxOf, LESSON_PAIRED, LESSON_PICTURE_ROOMY } from '../lesson-query';

interface KkLessonSwapProps {
  aspect: number;
  label: string;
  onSwap: () => void;
}

export const KkLessonSwap: FC<KkLessonSwapProps> = ({ aspect, label, onSwap }) => (
  <ButtonBase
    aria-label={label}
    onClick={onSwap}
    data-kk-lesson-swap
    sx={(theme) => ({
      position: 'absolute',
      zIndex: 3,
      minWidth: kkTokens.tapTarget,
      minHeight: kkTokens.tapTarget,
      borderRadius: `${kkTokens.radius.base - 4}px`,
      transition: kkTokens.motion.press,
      '&:active': { transform: 'scale(0.98)' },
      ...insetBoxOf(aspect),
      [LESSON_PICTURE_ROOMY]: { [LESSON_PAIRED]: { display: 'none' } },
      ...focusRing(theme),
    })}
  >
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top: '0.25rem',
        right: '0.25rem',
        width: '1.5rem',
        height: '1.5rem',
        display: 'grid',
        placeItems: 'center',
        borderRadius: `${kkTokens.radius.pill}px`,
        color: kkTokens.overlay.onPhotoText,
        backgroundColor: `color-mix(in srgb, ${kkTokens.overlay.scrimInk} 62%, transparent)`,
        backdropFilter: `blur(${kkTokens.glass.blur})`,
      }}
    >
      <SwapHorizRoundedIcon fontSize="small" />
    </Box>
  </ButtonBase>
);
