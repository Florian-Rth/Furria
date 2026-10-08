import { KkConfirmDialog, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import {
  DELETE_EVENT_EXPLANATION,
  DELETE_EVENT_LABEL,
  toDeleteEventConsequence,
  toDeleteEventQuestion,
  toEventFacts,
} from '../events-labels';
import { useEventDeletion } from '../hooks/use-event-deletion';
import type { EventDetails } from '../schemas';

const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface EventDeletionLineProps {
  event: EventDetails;
}

export const EventDeletionLine: FC<EventDeletionLineProps> = ({ event }) => {
  const deletion = useEventDeletion(event);
  const facts = toEventFacts(event);
  const question = toDeleteEventQuestion(event.title);
  const consequence = toDeleteEventConsequence(event.title);

  return (
    <>
      <KkWriteScreen.Danger label={DELETE_EVENT_LABEL} onSelect={deletion.open} />
      <KkConfirmDialog
        open={deletion.isOpen}
        onClose={deletion.close}
        onConfirm={deletion.submit}
        tone="danger"
        eyebrow={DELETE_EVENT_LABEL}
        question={question}
        explanation={DELETE_EVENT_EXPLANATION}
        facts={facts}
        consequence={consequence}
        error={deletion.rejection ?? undefined}
        confirmLabel={DELETE_EVENT_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={deletion.isSaving}
      />
    </>
  );
};
