import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { LOGIN_PATH } from '@/lib/login-redirect';
import { useSignOutMutation } from '../api';

interface SignOutState {
  signOut: () => void;
  isSigningOut: boolean;
}

export const useSignOut = (): SignOutState => {
  const mutation = useSignOutMutation();
  const queryClient = useQueryClient();
  const router = useRouter();

  const requestSignOut = (): void => {
    mutation.mutate(undefined, {
      onSettled: () => {
        queryClient.clear();
        router.history.replace(LOGIN_PATH);
      },
    });
  };

  return { signOut: requestSignOut, isSigningOut: mutation.isPending };
};
