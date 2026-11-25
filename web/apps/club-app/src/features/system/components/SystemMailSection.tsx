import { KkReadout } from '@furria/ui/KkReadout';
import type { FC } from 'react';
import type { SystemStatus } from '../schemas';
import { MAIL_FACT_LABELS, SECTION_TITLES } from '../system-copy';
import { SYSTEM_HELP_SPOTS } from '../system-help-copy';
import { mailViewOf } from '../system-view';

interface SystemMailSectionProps {
  status: SystemStatus;
  nowMs: number;
  dimmed: boolean;
}

export const SystemMailSection: FC<SystemMailSectionProps> = ({ status, nowMs, dimmed }) => {
  const mail = mailViewOf(status, nowMs);

  return (
    <KkReadout landing={SYSTEM_HELP_SPOTS.area} label={SECTION_TITLES.mail} dimmed={dimmed}>
      <KkReadout.Facts>
        <KkReadout.Fact label={MAIL_FACT_LABELS.pending} value={mail.pending} />
        <KkReadout.Fact label={MAIL_FACT_LABELS.retrying} value={mail.retrying} />
      </KkReadout.Facts>
      <KkReadout.Note text={mail.aside} />
    </KkReadout>
  );
};
