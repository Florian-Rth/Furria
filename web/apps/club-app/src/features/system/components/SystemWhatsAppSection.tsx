import { KkReadout } from '@furria/ui/KkReadout';
import type { FC } from 'react';
import type { SystemStatus } from '../schemas';
import { SECTION_TITLES, WHATSAPP_OUTBOX_FACT_LABELS } from '../system-copy';
import { whatsAppOutboxViewOf } from '../system-view';

interface SystemWhatsAppSectionProps {
  status: SystemStatus;
  nowMs: number;
  dimmed: boolean;
}

export const SystemWhatsAppSection: FC<SystemWhatsAppSectionProps> = ({
  status,
  nowMs,
  dimmed,
}) => {
  const outbox = whatsAppOutboxViewOf(status, nowMs);

  return (
    <KkReadout label={SECTION_TITLES.whatsApp} dimmed={dimmed}>
      <KkReadout.Facts>
        <KkReadout.Fact label={WHATSAPP_OUTBOX_FACT_LABELS.waiting} value={outbox.waiting} />
        <KkReadout.Fact label={WHATSAPP_OUTBOX_FACT_LABELS.retrying} value={outbox.retrying} />
        <KkReadout.Fact label={WHATSAPP_OUTBOX_FACT_LABELS.failed} value={outbox.failed} />
      </KkReadout.Facts>
      <KkReadout.Note text={outbox.aside} />
    </KkReadout>
  );
};
