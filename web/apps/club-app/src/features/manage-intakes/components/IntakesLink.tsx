import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useIntakesQuery } from '../api';
import {
  INTAKES_PATH,
  INTAKES_TITLE,
  toAwaitingIntakesLine,
  toNeedsReviewHint,
} from '../intake-labels';
import { toIntakeCounts } from '../intake-rules';
import type { IntakeSummary } from '../schemas';

const NO_INTAKES: readonly IntakeSummary[] = [];

export const IntakesLink: FC = () => {
  const intakes = useIntakesQuery();
  const counts = toIntakeCounts(intakes.data?.intakes ?? NO_INTAKES);
  const meta = toAwaitingIntakesLine(counts.awaitingCount);
  const hint = toNeedsReviewHint(counts.needsReviewCount);

  return (
    <KkPanel>
      <KkHubRow
        label={INTAKES_TITLE}
        icon="qr"
        meta={meta}
        hint={hint}
        hintTone="gold"
        component={Link}
        to={INTAKES_PATH}
      />
    </KkPanel>
  );
};
