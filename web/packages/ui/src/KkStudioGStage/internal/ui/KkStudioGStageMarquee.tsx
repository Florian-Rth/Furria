import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkStudioGStageShareBox } from '../logic/use-stage-pointer';

const PERCENT = 100;

interface KkStudioGStageMarqueeProps {
  box: KkStudioGStageShareBox | null;
}

export const KkStudioGStageMarquee: FC<KkStudioGStageMarqueeProps> = ({ box }) => {
  if (box === null) {
    return null;
  }
  const place = {
    left: `${Math.min(box.left, box.right) * PERCENT}%`,
    top: `${Math.min(box.top, box.bottom) * PERCENT}%`,
    width: `${Math.abs(box.right - box.left) * PERCENT}%`,
    height: `${Math.abs(box.bottom - box.top) * PERCENT}%`,
  };

  return (
    <Box
      aria-hidden
      data-kk-studio-g-marquee
      style={place}
      sx={(theme) => ({
        position: 'absolute',
        borderRadius: `${kkTokens.radius.bar}px`,
        border: `${kkTokens.line.hair}px dashed ${(theme.vars ?? theme).palette.text.primary}`,
        backgroundColor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.text.primary} 8%, transparent)`,
        pointerEvents: 'none',
        zIndex: 3,
      })}
    />
  );
};
