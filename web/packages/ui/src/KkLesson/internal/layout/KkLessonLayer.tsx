import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import {
  insetBoxOf,
  LESSON_PAIRED,
  LESSON_PICTURE_ROOMY,
  MAIN_BOX,
  STACKED_STAGE_BOX,
  STACKED_VIDEO_BOX,
} from '../lesson-query';

export type KkLessonLayerPlace = 'main' | 'inset' | 'off';
export type KkLessonLayerTone = 'ink' | 'paper';

const SWAP_MOTION = '260ms cubic-bezier(0.22, 0.61, 0.36, 1) both';

const arriveMain = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const arriveInset = keyframes`
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: none; }
`;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const toneOf = (theme: Theme, tone: KkLessonLayerTone): string =>
  tone === 'ink' ? kkTokens.overlay.scrimInk : palette(theme).background.default;

const STACKED_PAINT: CSSObject = {
  zIndex: 1,
  borderRadius: 0,
  boxShadow: 'none',
  animation: 'none',
};

const stackedOf = (tone: KkLessonLayerTone): CSSObject => ({
  [LESSON_PICTURE_ROOMY]: {
    [LESSON_PAIRED]: {
      ...STACKED_PAINT,
      ...(tone === 'ink' ? { ...STACKED_VIDEO_BOX, borderRadius: 'inherit' } : STACKED_STAGE_BOX),
    },
  },
});

const placePaint = (place: KkLessonLayerPlace, aspect: number, theme: Theme): CSSObject => {
  if (place === 'main') {
    return {
      ...MAIN_BOX,
      zIndex: 1,
      borderRadius: 'inherit',
      animation: `${arriveMain} ${SWAP_MOTION}`,
    };
  }

  return {
    ...insetBoxOf(aspect),
    zIndex: 2,
    transformOrigin: 'bottom right',
    borderRadius: `${kkTokens.radius.base - 4}px`,
    boxShadow: `0 0 0 ${kkTokens.line.section}px ${palette(theme).background.paper}, ${kkTokens.shadow.floating}`,
    animation: `${arriveInset} ${SWAP_MOTION}`,
    ...(place === 'off' ? { visibility: 'hidden', animation: 'none' } : {}),
  };
};

interface KkLessonLayerProps extends PropsWithChildren {
  place: KkLessonLayerPlace;
  aspect: number;
  tone: KkLessonLayerTone;
}

export const KkLessonLayer: FC<KkLessonLayerProps> = ({ place, aspect, tone, children }) => {
  const hidden = place === 'off';

  return (
    <Box
      aria-hidden={hidden}
      data-kk-lesson-layer={place}
      sx={(theme) => ({
        position: 'absolute',
        display: 'grid',
        placeItems: 'center',
        containerType: 'size',
        overflow: 'clip',
        backgroundColor: toneOf(theme, tone),
        ...placePaint(place, aspect, theme),
        ...stackedOf(tone),
      })}
    >
      {children}
    </Box>
  );
};
