import type { FC } from 'react';
import { KkHeading } from '../../../KkHeading';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const MOTTO_LINE_HEIGHT = 0.96;

interface KkMottoStageMottoProps {
  motto: string | null;
  pendingLabel: string;
  sx?: KkSx;
}

export const KkMottoStageMotto: FC<KkMottoStageMottoProps> = ({ motto, pendingLabel, sx }) => {
  const isPending = motto === null;
  const headline = motto ?? pendingLabel;
  const color = isPending ? 'text.secondary' : 'text.primary';

  return (
    <KkHeading
      level={1}
      component="p"
      sx={[
        {
          minWidth: 0,
          color,
          letterSpacing: kkTokens.type.tracking.display,
          lineHeight: MOTTO_LINE_HEIGHT,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {headline}
    </KkHeading>
  );
};
