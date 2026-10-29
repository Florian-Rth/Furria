import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import type { LabStudio } from '@/features/lab-studio/hooks/use-lab-studio';
import { useLabStudio } from '@/features/lab-studio/hooks/use-lab-studio';
import { STUDIO_A_FALLBACK_TITLE } from '../studio-a-copy';

export interface StudioAPage extends LabStudio {
  title: string;
  origin: KkScreenOrigin;
}

export const useStudioAPage = (rawActId: string): StudioAPage => {
  const lab = useLabStudio(rawActId);

  return {
    ...lab,
    title: lab.query.data?.act.name ?? STUDIO_A_FALLBACK_TITLE,
    origin: LAB_ORIGIN,
  };
};
