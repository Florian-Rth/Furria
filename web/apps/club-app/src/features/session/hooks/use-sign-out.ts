import { useSignOutMutation } from '../api';

interface SignOutState {
  signOut: () => void;
  isSigningOut: boolean;
}

export const useSignOut = (): SignOutState => {
  const mutation = useSignOutMutation();

  const requestSignOut = (): void => {
    mutation.mutate(undefined);
  };

  return { signOut: requestSignOut, isSigningOut: mutation.isPending };
};
