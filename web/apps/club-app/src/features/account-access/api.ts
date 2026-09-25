import { useKkNotice } from '@furria/ui';
import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toInvitationSentMessage } from './account-access-labels';
import { requestMailInvitation } from './requests';
import type { IssuedInvitation } from './schemas';
import type { AccessSubject } from './types';

export const useMailInvitationMutation = (
  subject: AccessSubject,
  onInvited: () => void,
): UseMutationResult<IssuedInvitation, Error, void> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestMailInvitation(subject.personId, accessToken)),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: toInvitationSentMessage(subject.firstName) });
      onInvited();
    },
  });
};
