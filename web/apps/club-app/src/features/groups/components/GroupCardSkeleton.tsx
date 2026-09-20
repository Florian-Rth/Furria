import { KkCard, KkSkeletonBlock, kkTokens } from '@furria/ui';
import type { FC } from 'react';

const FACE_RATIO = kkTokens.aspectRatio.landscape;
const FACE_LINES = 2;
const BODY_LINES = 3;
const FULL_HEIGHT = { height: '100%' } as const;
const FULL_WIDTH = { width: '100%' } as const;
const FACE_FILL = {
  position: 'absolute',
  inset: 0,
  justifyContent: 'flex-end',
  p: 1.75,
} as const;

export const GroupCardSkeleton: FC = () => (
  <KkCard sx={FULL_HEIGHT}>
    <KkCard.Media aspectRatio={FACE_RATIO}>
      <KkSkeletonBlock lines={FACE_LINES} sx={FACE_FILL} />
    </KkCard.Media>
    <KkCard.Body>
      <KkSkeletonBlock lines={BODY_LINES} sx={FULL_WIDTH} />
    </KkCard.Body>
  </KkCard>
);
