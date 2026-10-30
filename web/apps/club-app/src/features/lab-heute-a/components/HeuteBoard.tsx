import { KkHall } from '@furria/ui/KkHall';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkKeyList } from '@furria/ui/KkKeyList';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import type { FC } from 'react';
import { CLOSE, HELP_TITLE, HEUTE_KEYS } from '../heute-a-copy';
import type { HeuteA } from '../hooks/use-heute-a';
import { HeuteClockLive } from './HeuteClockLive';
import { HeuteKeys } from './HeuteKeys';
import { HeuteStrips } from './HeuteStrips';
import { HeuteUpNext } from './HeuteUpNext';

interface HeuteBoardProps {
  heute: HeuteA;
}

export const HeuteBoard: FC<HeuteBoardProps> = ({ heute }) => (
  <KkHall label={heute.label}>
    <KkVisuallyHidden>
      <KkHeading level={1} component="h1">
        {heute.label}
      </KkHeading>
    </KkVisuallyHidden>
    <HeuteClockLive heute={heute} />
    <KkHall.Area area="stage" fill="start">
      <HeuteUpNext heute={heute} />
    </KkHall.Area>
    <KkHall.Area area="absent">
      <HeuteStrips heute={heute} />
    </KkHall.Area>
    <KkHall.Area area="keys">
      <HeuteKeys heute={heute} />
    </KkHall.Area>
    <KkHall.Corner>
      <KkHall.Close label={CLOSE} onPress={heute.close} />
      <KkHall.Help label={HELP_TITLE}>
        <KkKeyList title={HELP_TITLE} entries={HEUTE_KEYS} />
      </KkHall.Help>
    </KkHall.Corner>
  </KkHall>
);
