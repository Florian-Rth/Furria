import { KkAvatar } from '@furria/ui/KkAvatar';
import { KkChip } from '@furria/ui/KkChip';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkSinceRow } from '@furria/ui/KkSinceRow';
import type { FC } from 'react';
import { NOT_ACTIVE_IN_CLUB_CHIP } from '../manage-keys-labels';

const SINCE_LABEL = 'seit';
const ACTIVE_NAME = 'Anna Becker';
const ACTIVE_SINCE = '12.11.2023';
const INACTIVE_NAME = 'Jonas Klein';
const INACTIVE_SINCE = '03.09.2021';

const activeAvatar = <KkAvatar initials="AB" size="small" component="span" />;
const inactiveAvatar = <KkAvatar initials="JK" size="small" component="span" />;
const takeBackChip = (
  <KkChip tone={NOT_ACTIVE_IN_CLUB_CHIP.tone} dot={NOT_ACTIVE_IN_CLUB_CHIP.dot} size="small">
    {NOT_ACTIVE_IN_CLUB_CHIP.label}
  </KkChip>
);

export const KeysHelpHolderPreview: FC = () => (
  <KkPanel variant="list">
    <KkSinceRow
      avatar={activeAvatar}
      title={ACTIVE_NAME}
      sinceLabel={SINCE_LABEL}
      sinceValue={ACTIVE_SINCE}
    />
    <KkSinceRow
      avatar={inactiveAvatar}
      title={INACTIVE_NAME}
      sinceLabel={SINCE_LABEL}
      sinceValue={INACTIVE_SINCE}
      trailing={takeBackChip}
    />
  </KkPanel>
);
