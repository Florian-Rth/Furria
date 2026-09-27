import { toMailRequestFailureMessage } from '@/features/login';
import { useRequestPasswordResetMutation } from '../api';

interface ForgotPasswordControl {
  isSent: boolean;
  isRequesting: boolean;
  failure: string | null;
  request: (email: string) => void;
}

export const useForgotPassword = (): ForgotPasswordControl => {
  const mutation = useRequestPasswordResetMutation();

  return {
    isSent: mutation.isSuccess,
    isRequesting: mutation.isPending,
    failure: toMailRequestFailureMessage(mutation.error),
    request: (email) => {
      mutation.mutate(email);
    },
  };
};
