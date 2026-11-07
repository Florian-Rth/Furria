import { useNavigate } from '@tanstack/react-router';
import { originSearchOf } from '@/features/act-card/act-card-paths';
import { ACT_EDIT_PATH } from '@/features/acts/act-screens';
import type { ActScreenSearch } from '@/features/acts/schemas';
import type { ActStudioPage } from './use-act-studio-page';
import { useActStudioPage } from './use-act-studio-page';

export interface StepSetupPage extends ActStudioPage {
  leave: () => void;
}

export const useStepSetupPage = (rawActId: string, search: ActScreenSearch): StepSetupPage => {
  const navigate = useNavigate();
  const page = useActStudioPage(rawActId, search);

  return {
    ...page,
    leave: () => {
      void navigate({
        to: ACT_EDIT_PATH,
        params: { actId: rawActId },
        search: originSearchOf(search),
        replace: true,
      });
    },
  };
};
