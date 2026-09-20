import type { FC } from 'react';
import { KkHeading } from '../../../KkHeading';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const MOTTO_SIZE = { xs: kkTokens.headline.compact, desktop: kkTokens.headline.page };
const MOTTO_LINE_HEIGHT = 0.96;

interface KkMottoStageMottoProps {
  motto: string | null;
  sx?: KkSx;
}

export const KkMottoStageMotto: FC<KkMottoStageMottoProps> = ({ motto, sx }) => {
  if (motto === null) {
    return null;
  }

  return (
    <KkHeading
      level={1}
      component="p"
      sx={[
        {
          minWidth: 0,
          color: 'text.primary',
          fontSize: MOTTO_SIZE,
          letterSpacing: kkTokens.type.tracking.display,
          lineHeight: MOTTO_LINE_HEIGHT,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {motto}
    </KkHeading>
  );
};
