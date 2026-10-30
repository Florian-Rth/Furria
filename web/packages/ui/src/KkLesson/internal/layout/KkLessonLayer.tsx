import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import { insetBoxOf, LESSON_SWAP_MOTION, MAIN_BOX } from '../lesson-query';

export type KkLessonLayerPlace = 'main' | 'inset' | 'off';
export type KkLessonLayerTone = 'ink' | 'paper';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const toneOf = (theme: Theme, tone: KkLessonLayerTone): string =>
  tone === 'ink' ? kkTokens.overlay.scrimInk : palette(theme).background.default;

const placePaint = (place: KkLessonLayerPlace, aspect: number, theme: Theme): CSSObject => {
  if (place === 'main') {
    return { ...MAIN_BOX, zIndex: 1, borderRadius: 'inherit' };
  }

  return {
    ...insetBoxOf(aspect),
    zIndex: 2,
    borderRadius: `${kkTokens.radius.base - 4}px`,
    boxShadow: `0 0 0 ${kkTokens.line.section}px ${palette(theme).background.paper}, ${kkTokens.shadow.floating}`,
    ...(place === 'off' ? { opacity: 0, visibility: 'hidden' } : {}),
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
        transition: LESSON_SWAP_MOTION,
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        ...placePaint(place, aspect, theme),
      })}
    >
      {children}
    </Box>
  );
};
