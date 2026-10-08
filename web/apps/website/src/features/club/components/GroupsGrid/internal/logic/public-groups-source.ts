import type { PublicGroup } from '@/lib/public-groups/schemas';

export type PublicGroupsSource =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; groups: PublicGroup[] };

export const resolvePublicGroupsSource = (
  groups: PublicGroup[] | undefined,
  hasFailed: boolean,
  retry: () => void,
): PublicGroupsSource => {
  if (groups !== undefined) {
    return { status: 'ready', groups };
  }

  return hasFailed ? { status: 'error', retry } : { status: 'loading' };
};
