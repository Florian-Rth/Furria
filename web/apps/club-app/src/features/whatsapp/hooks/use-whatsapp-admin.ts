import type { KkScreenActionBar } from '@furria/ui/screen-declaration';
import { isForbiddenError } from '@/lib/query-error';
import { useStartWhatsAppLinkingMutation, useWhatsAppOverviewQuery } from '../api';
import type { WhatsAppOverview } from '../schemas';
import { START_LINKING_LABEL } from '../whatsapp-copy';
import { canStartLinking } from '../whatsapp-linking';

export type WhatsAppAdminRead =
  | { kind: 'loading' }
  | { kind: 'denied' }
  | { kind: 'failed' }
  | { kind: 'shown'; overview: WhatsAppOverview };

export interface WhatsAppAdminControl {
  read: WhatsAppAdminRead;
  action: KkScreenActionBar | undefined;
  isRetrying: boolean;
  retry: () => void;
}

const readOf = (overview: WhatsAppOverview | undefined, error: Error | null): WhatsAppAdminRead => {
  if (overview !== undefined) {
    return { kind: 'shown', overview };
  }
  if (isForbiddenError(error)) {
    return { kind: 'denied' };
  }

  return error === null ? { kind: 'loading' } : { kind: 'failed' };
};

export const useWhatsAppAdmin = (): WhatsAppAdminControl => {
  const query = useWhatsAppOverviewQuery();
  const startLinking = useStartWhatsAppLinkingMutation();
  const link: KkScreenActionBar['primary'] = {
    label: START_LINKING_LABEL,
    icon: 'link',
    loading: startLinking.isPending,
    onSelect: () => {
      startLinking.mutate(undefined);
    },
  };
  const state = query.data?.state;

  return {
    read: readOf(query.data, query.error),
    action: state !== undefined && canStartLinking(state) ? { primary: link } : undefined,
    isRetrying: query.isFetching,
    retry: () => {
      void query.refetch();
    },
  };
};
