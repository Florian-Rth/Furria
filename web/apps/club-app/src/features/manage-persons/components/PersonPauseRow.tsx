import { KkChip, KkFactRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import { currentSessionYear } from '@/lib/club';
import { toSessionPeriodChip } from '@/lib/state-chips';
import { PAUSE_ROW_TITLE, SESSION_SPAN_LABEL, toPauseSpan } from '../manage-persons-labels';
import type { PersonPause } from '../schemas';

const PAUSE_ROUTE = '/manage/persons/$personId/pauses/$pauseId';

interface PersonPauseRowProps {
  personId: number;
  pause: PersonPause;
  highlight?: boolean;
}

export const PersonPauseRow: FC<PersonPauseRowProps> = ({ personId, pause, highlight = false }) => {
  const periodChip = toSessionPeriodChip(
    pause.firstSessionYear,
    pause.lastSessionYear,
    currentSessionYear(),
  );

  const chip =
    periodChip === null ? undefined : (
      <KkChip tone={periodChip.tone} dot={periodChip.dot} size="small">
        {periodChip.label}
      </KkChip>
    );

  return (
    <KkFactRow
      title={PAUSE_ROW_TITLE}
      span={toPauseSpan(pause)}
      spanLabel={SESSION_SPAN_LABEL}
      chip={chip}
      tone="gold"
      highlight={highlight}
      landing={toLandingKey('pause', pause.pauseId)}
      component={Link}
      to={PAUSE_ROUTE}
      params={{ personId: String(personId), pauseId: String(pause.pauseId) }}
    />
  );
};
