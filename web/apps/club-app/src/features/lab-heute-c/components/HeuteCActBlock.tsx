import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkHall } from '@furria/ui/KkHall';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkStatusLine } from '@furria/ui/KkStatusLine';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toAfterLine, toBlockEyebrow } from '../heute-c-copy';
import { PORTRAIT_ONLY_TEXT } from '../heute-c-layout';
import type { HeuteCAct } from '../hooks/use-heute-c';
import { HeuteCNames } from './HeuteCNames';

interface HeuteCActBlockProps {
  eyebrow: string;
  act: HeuteCAct;
  elapsed: string | null;
  after: string | null;
  strong: boolean;
}

export const HeuteCActBlock: FC<HeuteCActBlockProps> = ({
  eyebrow,
  act,
  elapsed,
  after,
  strong,
}) => {
  const title = strong ? (
    <KkHall.Step name={act.name} meta={null} next={null} />
  ) : (
    <KkText variant="subtitle1" clamp={1}>
      {act.name}
    </KkText>
  );
  const clock =
    elapsed === null ? null : (
      <KkHeading level={2} component="p" sx={{ flexShrink: 0 }}>
        {elapsed}
      </KkHeading>
    );
  const missing =
    act.missingLine === null ? null : <KkStatusLine tone="attention" text={act.missingLine} />;
  const afterText = after === null ? null : toAfterLine(after);
  const afterLine =
    afterText === null ? null : (
      <KkMeta lines={1} sx={PORTRAIT_ONLY_TEXT}>
        {afterText}
      </KkMeta>
    );
  const heading = toBlockEyebrow(eyebrow, act.position);

  return (
    <Stack sx={{ gap: 0.75, minWidth: 0 }}>
      <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1, minWidth: 0 }}>
        <KkEyebrow tone="accent" sx={{ flex: 1, minWidth: 0 }}>
          {heading}
        </KkEyebrow>
        {clock}
      </Stack>
      {title}
      <HeuteCNames names={act.names} />
      {missing}
      {afterLine}
    </Stack>
  );
};
