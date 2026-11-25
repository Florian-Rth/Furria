import { usePushTopics } from '@/features/push/hooks/use-push-topics';
import type { PersonalMe } from '@/lib/api/schemas';

export interface ProfileHelpViewer {
  keepsClubGroup: boolean;
  isAffiliated: boolean;
  hearsPush: boolean;
}

export const useProfileHelpViewer = (me: PersonalMe | undefined): ProfileHelpViewer => {
  const { hearsNothing } = usePushTopics();

  return {
    keepsClubGroup: me?.keepsClubGroup ?? false,
    isAffiliated: me?.isAffiliated ?? false,
    hearsPush: !hearsNothing,
  };
};
