import { KkButton } from '@furria/ui/KkButton';
import { KkCheckLine } from '@furria/ui/KkCheckLine';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { PaneCheck } from '../detail-checks';
import {
  CHECK_ICONS,
  CHECK_LABELS,
  CHECK_LINES,
  FIX_LABELS,
  toCheckValue,
} from '../event-pane-copy';
import type { EventDetails } from '../schemas';

const FIX_PATHS = {
  edit: '/events/$eventId/edit',
  picture: '/events/$eventId/manage',
} as const;

interface EventCheckRowProps {
  check: PaneCheck;
  event: EventDetails;
  showsFix?: boolean;
}

export const EventCheckRow: FC<EventCheckRowProps> = ({ check, event, showsFix = true }) => {
  const params = { eventId: String(event.eventId) };
  const value = toCheckValue(event, check.key);
  const label = CHECK_LABELS[check.key];
  const action =
    check.fix === null || !showsFix ? undefined : (
      <KkButton
        size="small"
        variant="outlined"
        component={Link}
        to={FIX_PATHS[check.fix]}
        params={params}
      >
        {FIX_LABELS[check.fix]}
      </KkButton>
    );

  return (
    <KkCheckLine
      label={label}
      value={value}
      state={check.state}
      icon={CHECK_ICONS[check.key]}
      lines={CHECK_LINES[check.key]}
      action={action}
    />
  );
};
