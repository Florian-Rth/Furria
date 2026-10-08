import { KkConfirmDialog, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import { toEventCancellationCopy, toEventFacts } from '../events-labels';
import { useEventCancellation } from '../hooks/use-event-cancellation';
import type { EventDetails } from '../schemas';

const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface EventCancellationLineProps {
  event: EventDetails;
}

export const EventCancellationLine: FC<EventCancellationLineProps> = ({ event }) => {
  const cancellation = useEventCancellation(event);
  const copy = toEventCancellationCopy(event);
  const facts = toEventFacts(event);

  const line =
    event.cancelledAt === null ? (
      <KkWriteScreen.Danger label={copy.lineLabel} onSelect={cancellation.open} />
    ) : (
      <KkWriteScreen.Quiet label={copy.lineLabel} onSelect={cancellation.open} />
    );

  return (
    <>
      {line}
      <KkConfirmDialog
        open={cancellation.isOpen}
        onClose={cancellation.close}
        onConfirm={cancellation.submit}
        tone={copy.tone}
        eyebrow={copy.lineLabel}
        question={copy.question}
        explanation={copy.explanation}
        facts={facts}
        consequence={copy.consequence}
        error={cancellation.rejection ?? undefined}
        confirmLabel={copy.confirmLabel}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={cancellation.isSaving}
      />
    </>
  );
};
