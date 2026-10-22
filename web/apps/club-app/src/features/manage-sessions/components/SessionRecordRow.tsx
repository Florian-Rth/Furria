import { KkChip } from '@furria/ui/KkChip';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkSessionRow } from '@furria/ui/KkSessionRow';
import { logoSourceOf } from '@furria/ui/logo-source';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useLanding } from '@/features/write/hooks/use-landing';
import { toLandingKey } from '@/features/write/landing-target';
import {
  toSessionNumberLabel,
  toSessionRowChip,
  toSessionRowMotto,
  toSessionSeasonLabel,
} from '../manage-sessions-labels';
import type { SessionRecordSummary } from '../schemas';

const EDIT_ROUTE = '/manage/sessions/$sessionId/edit';

interface SessionRecordRowProps {
  record: SessionRecordSummary;
  today: Date;
}

export const SessionRecordRow: FC<SessionRecordRowProps> = ({ record, today }) => {
  const { highlightedKey } = useLanding();
  const landingKey = toLandingKey('session', record.sessionId);
  const seasonChip = toSessionRowChip(record, today);
  const motto = toSessionRowMotto(record, today);
  const numberLabel = toSessionNumberLabel(record.number);
  const seasonLabel = toSessionSeasonLabel(record.startYear);
  const logoSource = logoSourceOf(record.logoSvg);
  const routeParams = { sessionId: String(record.sessionId) };
  const highlighted = highlightedKey === landingKey;

  const chip =
    seasonChip === null ? null : (
      <KkChip tone={seasonChip.tone} dot={seasonChip.dot} size="small">
        {seasonChip.label}
      </KkChip>
    );

  const numberLine = numberLabel === null ? null : <KkMeta>{numberLabel}</KkMeta>;

  return (
    <KkSessionRow
      component={Link}
      to={EDIT_ROUTE}
      params={routeParams}
      highlight={highlighted}
      landing={landingKey}
    >
      <KkSessionRow.Emblem source={logoSource} />
      <KkSessionRow.Body>
        <KkSessionRow.Heading>
          <KkSessionRow.Season>{seasonLabel}</KkSessionRow.Season>
          {chip}
        </KkSessionRow.Heading>
        <KkSessionRow.Motto missing={motto.missing}>{motto.line}</KkSessionRow.Motto>
        {numberLine}
      </KkSessionRow.Body>
    </KkSessionRow>
  );
};
