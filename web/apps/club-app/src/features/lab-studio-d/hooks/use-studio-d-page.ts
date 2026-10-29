import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import type { LabStudio } from '@/features/lab-studio/hooks/use-lab-studio';
import { useLabStudio } from '@/features/lab-studio/hooks/use-lab-studio';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { STUDIO_D_FALLBACK_TITLE } from '../studio-d-copy';

export interface StudioDPage extends LabStudio {
  title: string;
  close: () => void;
}

export const useStudioDPage = (rawActId: string): StudioDPage => {
  const lab = useLabStudio(rawActId);
  const goBackTo = useGoBackTo();

  return {
    ...lab,
    title: lab.query.data?.act.name ?? STUDIO_D_FALLBACK_TITLE,
    close: () => {
      void goBackTo({ to: LAB_ORIGIN.to });
    },
  };
};
