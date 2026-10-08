import { KkButton, KkConfirmDialog, KkFactRow, KkIcon } from '@furria/ui';
import type { FC } from 'react';
import { useTicketRequestHandling } from '../hooks/use-ticket-request-handling';
import type { TicketRequest } from '../schemas';
import {
  HANDLE_REQUEST_CONSEQUENCE,
  HANDLE_REQUEST_EXPLANATION,
  HANDLE_REQUEST_EYEBROW,
  HANDLE_REQUEST_LABEL,
  toHandleRequestQuestion,
  toRequestedAtLabel,
  toTicketRequestFacts,
  toTicketUnitLabel,
} from '../ticket-requests-labels';
import { TicketRequestContact } from './TicketRequestContact';

const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface TicketRequestRowProps {
  request: TicketRequest;
}

export const TicketRequestRow: FC<TicketRequestRowProps> = ({ request }) => {
  const handling = useTicketRequestHandling(request);
  const span = String(request.ticketCount);
  const spanLabel = toTicketUnitLabel(request.ticketCount);
  const meta = toRequestedAtLabel(request);
  const question = toHandleRequestQuestion(request);
  const facts = toTicketRequestFacts(request);

  const handleAction = (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name="check" size="small" />}
      onClick={handling.open}
    >
      {HANDLE_REQUEST_LABEL}
    </KkButton>
  );

  return (
    <>
      <KkFactRow
        title={request.name}
        span={span}
        spanLabel={spanLabel}
        meta={meta}
        actions={handleAction}
      >
        <TicketRequestContact request={request} />
      </KkFactRow>
      <KkConfirmDialog
        open={handling.isOpen}
        onClose={handling.close}
        onConfirm={handling.submit}
        eyebrow={HANDLE_REQUEST_EYEBROW}
        question={question}
        explanation={HANDLE_REQUEST_EXPLANATION}
        facts={facts}
        consequence={HANDLE_REQUEST_CONSEQUENCE}
        error={handling.rejection ?? undefined}
        confirmLabel={HANDLE_REQUEST_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={handling.isSaving}
      />
    </>
  );
};
