import { KkChip } from '@furria/ui/KkChip';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkSessionRow } from '@furria/ui/KkSessionRow';
import type { FC } from 'react';
import {
  RELEVANT_SESSION_CHIP,
  toSessionMottoLine,
  toSessionNumberLabel,
  toSessionSeasonLabel,
  VACANT_SESSION_LINE,
} from '../manage-sessions-labels';

const VACANT_YEAR = 2026;
const PAST_YEAR = 2025;
const PAST_MOTTO = toSessionMottoLine('Mit Pauken und Trompeten');
const PAST_NUMBER = toSessionNumberLabel(55);

export const SessionsHelpRowsPreview: FC = () => (
  <KkPanel variant="list">
    <KkSessionRow>
      <KkSessionRow.Vacancy />
      <KkSessionRow.Body>
        <KkSessionRow.Heading>
          <KkSessionRow.Season>{toSessionSeasonLabel(VACANT_YEAR)}</KkSessionRow.Season>
          <KkChip tone={RELEVANT_SESSION_CHIP.tone} dot={RELEVANT_SESSION_CHIP.dot} size="small">
            {RELEVANT_SESSION_CHIP.label}
          </KkChip>
        </KkSessionRow.Heading>
        <KkSessionRow.Motto missing>{VACANT_SESSION_LINE}</KkSessionRow.Motto>
      </KkSessionRow.Body>
    </KkSessionRow>
    <KkSessionRow>
      <KkSessionRow.Emblem image={null} />
      <KkSessionRow.Body>
        <KkSessionRow.Heading>
          <KkSessionRow.Season>{toSessionSeasonLabel(PAST_YEAR)}</KkSessionRow.Season>
        </KkSessionRow.Heading>
        <KkSessionRow.Motto missing={false}>{PAST_MOTTO}</KkSessionRow.Motto>
        <KkMeta>{PAST_NUMBER}</KkMeta>
      </KkSessionRow.Body>
    </KkSessionRow>
  </KkPanel>
);
