import type { FC } from 'react';
import { lineClamp } from '../../../internal/line-clamp';
import { KkHeading } from '../../../KkHeading';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const TITLE_LINES = 2;
const TITLE_LINE_HEIGHT = 0.92;

interface KkGroupStageTitleProps {
  name: string;
  sx?: KkSx;
}

export const KkGroupStageTitle: FC<KkGroupStageTitleProps> = ({ name, sx }) => (
  <KkHeading
    level={1}
    component="p"
    sx={[
      {
        color: 'inherit',
        typography: 'display',
        letterSpacing: kkTokens.type.tracking.display,
        lineHeight: TITLE_LINE_HEIGHT,
        textShadow: kkTokens.overlay.textShadow,
        ...lineClamp(TITLE_LINES),
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {name}
  </KkHeading>
);
