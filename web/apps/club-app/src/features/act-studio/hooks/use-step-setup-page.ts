import { useNavigate } from '@tanstack/react-router';
import { ACT_PAGE_PATH } from '@/features/acts/acts-origin';
import type { ActPageSearch } from '@/features/acts/schemas';
import { editorTargetOf } from '../editor-search';
import type { ActStudioPage } from './use-act-studio-page';
import { useActStudioPage } from './use-act-studio-page';

export interface StepSetupPage extends ActStudioPage {
  leave: () => void;
}

export const useStepSetupPage = (rawActId: string, search: ActPageSearch): StepSetupPage => {
  const navigate = useNavigate();
  const page = useActStudioPage(rawActId, search);

  return {
    ...page,
    leave: () => {
      void navigate({
        to: ACT_PAGE_PATH,
        params: { actId: rawActId },
        search: editorTargetOf(search),
        replace: true,
      });
    },
  };
};
