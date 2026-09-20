import { KkButton, KkChip, KkFactRow } from '@furria/ui';
import type { FC } from 'react';
import {
  hasSessionLogo,
  SESSION_SPAN_LABEL,
  toSessionDeleteActionLabel,
  toSessionEditActionLabel,
  toSessionLogoLabel,
  toSessionNumberLabel,
  toSessionRowChip,
  toSessionRowTitle,
  toSessionSeasonLabel,
} from '../manage-sessions-labels';
import type { SessionRecordSummary } from '../schemas';
import { SessionLogoMark } from './SessionLogoMark';

const EDIT_LABEL = 'Bearbeiten';
const DELETE_LABEL = 'Löschen';
const LOGO_SIZE = 34;

interface SessionRecordRowProps {
  record: SessionRecordSummary;
  today: Date;
  onEdit: (record: SessionRecordSummary) => void;
  onDelete: (record: SessionRecordSummary) => void;
}

export const SessionRecordRow: FC<SessionRecordRowProps> = ({
  record,
  today,
  onEdit,
  onDelete,
}) => {
  const seasonChip = toSessionRowChip(record, today);
  const seasonLabel = toSessionSeasonLabel(record.startYear);
  const title = toSessionRowTitle(record);
  const numberLine = toSessionNumberLabel(record.number) ?? undefined;

  const edit = (): void => {
    onEdit(record);
  };

  const remove = (): void => {
    onDelete(record);
  };

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

  const actions = (
    <>
      <KkButton
        size="small"
        variant="text"
        ariaLabel={toSessionEditActionLabel(record)}
        onClick={edit}
      >
        {EDIT_LABEL}
      </KkButton>
      <KkButton
        size="small"
        variant="text"
        tone="danger"
        ariaLabel={toSessionDeleteActionLabel(record)}
        onClick={remove}
      >
        {DELETE_LABEL}
      </KkButton>
    </>
  );

  return (
    <KkFactRow
      title={title}
      span={seasonLabel}
      spanLabel={SESSION_SPAN_LABEL}
      meta={numberLine}
      chip={chip}
      actions={actions}
    >
      {logoMark}
    </KkFactRow>
  );
};
