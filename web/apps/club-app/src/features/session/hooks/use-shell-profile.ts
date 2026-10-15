import type { KkShellProfile } from '@furria/ui';
import { toImageSource } from '@furria/ui';
import { toAvatarHonours } from '@/lib/honours';
import { toInitials } from '@/lib/initials';
import { PROFILE_PATH } from '../app-sections';
import { SHELL_PROFILE_LABEL } from '../session-messages';
import { usePersonalMe } from './use-personal-me';

export const useShellProfile = (): KkShellProfile | undefined => {
  const me = usePersonalMe();

  if (me.data === undefined) {
    return undefined;
  }

  const { person, honours } = me.data;

  return {
    label: SHELL_PROFILE_LABEL,
    to: PROFILE_PATH,
    initials: toInitials(person.firstName, person.lastName),
    image: toImageSource(person.portrait?.picture ?? null, 'portrait'),
    honours: toAvatarHonours(honours),
  };
};
