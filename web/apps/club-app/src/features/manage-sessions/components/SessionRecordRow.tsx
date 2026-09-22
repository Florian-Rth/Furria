import { KkChip, KkFactRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey, useLanding } from '@/features/write';
import {
  hasSessionLogo,
  SESSION_SPAN_LABEL,
  toSessionLogoLabel,
  toSessionNumberLabel,
  toSessionRowChip,
  toSessionRowTitle,
  toSessionSeasonLabel,
} from '../manage-sessions-labels';
import type { SessionRecordSummary } from '../schemas';
import { SessionLogoMark } from './SessionLogoMark';

const LOGO_SIZE = 34;
const EDIT_ROUTE = '/manage/sessions/$sessionId/edit';

interface SessionRecordRowProps {
  record: SessionRecordSummary;
  today: Date;
}

export const SessionRecordRow: FC<SessionRecordRowProps> = ({ record, today }) => {
  const { highlightedKey } = useLanding();
  const landingKey = toLandingKey('session', record.sessionId);
  const seasonChip = toSessionRowChip(record, today);
  const seasonLabel = toSessionSeasonLabel(record.startYear);
  const title = toSessionRowTitle(record);
  const numberLine = toSessionNumberLabel(record.number) ?? undefined;

  const chip =
    seasonChip === null ? undefined : (
      <KkChip tone={seasonChip.tone} dot={seasonChip.dot} size="small">
        {seasonChip.label}
      </KkChip>
    );

  const logoMark = hasSessionLogo(record) ? (
    <SessionLogoMark
      logoSvg={record.logoSvg}
      label={toSessionLogoLabel(seasonLabel)}
      size={LOGO_SIZE}
    />
  ) : undefined;

  return (
    <KkFactRow
      title={title}
      span={seasonLabel}
      spanLabel={SESSION_SPAN_LABEL}
      meta={numberLine}
      chip={chip}
      component={Link}
      to={EDIT_ROUTE}
      params={{ sessionId: String(record.sessionId) }}
      highlight={highlightedKey === landingKey}
      landing={landingKey}
    >
      {logoMark}
    </KkFactRow>
  );
};
