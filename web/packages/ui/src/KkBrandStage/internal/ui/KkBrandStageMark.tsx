import type { FC } from 'react';
import { KkBroomMark } from '../../../KkBroomMark';
import type { KkBrandStageVariant } from '../brand-stage-variant';

const markSize: Record<KkBrandStageVariant, Record<string, number>> = {
  poster: { xs: 120, desktop: 168 },
  band: { xs: 132, desktop: 156 },
};

interface KkBrandStageMarkProps {
  variant?: KkBrandStageVariant;
}

export const KkBrandStageMark: FC<KkBrandStageMarkProps> = ({ variant = 'poster' }) => (
  <KkBroomMark
    size={markSize[variant].desktop}
    sx={{
      color: 'primary.main',
      width: markSize[variant],
      height: markSize[variant],
    }}
  />
);
