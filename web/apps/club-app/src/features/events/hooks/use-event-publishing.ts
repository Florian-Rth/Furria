import type { KkPublishStamp } from '@furria/ui/publish-stamp';
import type { KkScreenActionBar, KkScreenDeedHold } from '@furria/ui/screen-declaration';
import type { KkPublishCeremonyRun } from '@furria/ui/use-publish-ceremony';
import { useKkPublishCeremony } from '@furria/ui/use-publish-ceremony';
import { useState } from 'react';
import { useSignerName } from '@/features/session/hooks/use-signer-name';
import {
  PUBLISH_HOLD_HINT,
  PUBLISHED_STAMP,
  publishConfirmOf,
  websiteAddressOf,
} from '@/lib/publish-copy';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useEventPublishedMutation } from '../api';
import { publishStateOf } from '../event-plan';
import type { EventDetails } from '../schemas';

const PUBLIC_EVENTS_PATH = '/events/';
const PUBLISH_LABEL = 'Veröffentlichen';
const PUBLISH_CONTEXT = 'Alles steht · noch nicht auf der Website';
const PUBLISH_HOLD: KkScreenDeedHold = {
  hint: PUBLISH_HOLD_HINT,
  confirm: publishConfirmOf({
    eyebrow: 'Veranstaltungen',
    question: 'Veranstaltung jetzt veröffentlichen?',
    explanation: 'Sie steht sofort auf der Website und im Kalender aller Mitglieder.',
    confirmLabel: 'Veröffentlichen',
  }),
};

export interface EventPublishing {
  bar: KkScreenActionBar | undefined;
  ceremony: KkPublishCeremonyRun<EventDetails>;
  rejection: string | null;
}

export const useEventPublishing = (event: EventDetails | undefined): EventPublishing => {
  const signer = useSignerName();
  const publication = useEventPublishedMutation();
  const [rejection, setRejection] = useState<string | null>(null);

  const stampOf = (published: EventDetails, stampedAt: string): KkPublishStamp => ({
    title: PUBLISHED_STAMP,
    signer,
    at: stampedAt,
    address: websiteAddressOf(`${PUBLIC_EVENTS_PATH}${published.eventId}`),
  });

  const ceremony = useKkPublishCeremony({
    stampOf,
    onFailed: (error: Error) => {
      setRejection(toWriteErrorMessage(error));
    },
  });

  const isReady = event !== undefined && publishStateOf(event) === 'ready';

  if (event === undefined || (!isReady && !ceremony.isBusy)) {
    return { bar: undefined, ceremony, rejection };
  }

  const publish = (): void => {
    setRejection(null);
    ceremony.start(() => publication.mutateAsync(event).then(() => event));
  };

  return {
    bar: {
      context: PUBLISH_CONTEXT,
      primary: {
        label: PUBLISH_LABEL,
        onSelect: publish,
        disabled: ceremony.isBusy,
        hold: PUBLISH_HOLD,
      },
    },
    ceremony,
    rejection,
  };
};
