import { KkChip, KkSessionRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  RELEVANT_SESSION_CHIP,
  toSessionSeasonLabel,
  VACANT_SESSION_LINE,
} from '../manage-sessions-labels';

const CREATE_ROUTE = '/manage/sessions/new';

interface VacantSessionRowProps {
  startYear: number;
}

export const VacantSessionRow: FC<VacantSessionRowProps> = ({ startYear }) => {
  const seasonLabel = toSessionSeasonLabel(startYear);
  const createSearch = { startYear };

  return (
    <KkSessionRow component={Link} to={CREATE_ROUTE} search={createSearch}>
      <KkSessionRow.Vacancy />
      <KkSessionRow.Body>
        <KkSessionRow.Heading>
          <KkSessionRow.Season>{seasonLabel}</KkSessionRow.Season>
          <KkChip tone={RELEVANT_SESSION_CHIP.tone} dot={RELEVANT_SESSION_CHIP.dot} size="small">
            {RELEVANT_SESSION_CHIP.label}
          </KkChip>
        </KkSessionRow.Heading>
        <KkSessionRow.Motto missing>{VACANT_SESSION_LINE}</KkSessionRow.Motto>
      </KkSessionRow.Body>
    </KkSessionRow>
  );
};
