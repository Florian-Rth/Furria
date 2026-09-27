import { toMailRequestFailureMessage } from '@/features/login';
import { useRequestAccessMutation } from '../api';

interface RequestAccessControl {
  isSent: boolean;
  isRequesting: boolean;
  failure: string | null;
  request: (email: string) => void;
}

export const useRequestAccess = (): RequestAccessControl => {
  const mutation = useRequestAccessMutation();

  return {
    isSent: mutation.isSuccess,
    isRequesting: mutation.isPending,
    failure: toMailRequestFailureMessage(mutation.error),
    request: (email) => {
      mutation.mutate(email);
    },
  };
};
