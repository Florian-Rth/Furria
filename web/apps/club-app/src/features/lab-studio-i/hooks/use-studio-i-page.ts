import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import type { LabStudio } from '@/features/lab-studio/hooks/use-lab-studio';
import { useLabStudio } from '@/features/lab-studio/hooks/use-lab-studio';
import { STUDIO_I_FALLBACK_TITLE } from '../studio-i-copy';

export interface StudioIPageState extends LabStudio {
  title: string;
  origin: KkScreenOrigin;
}

export const useStudioIPage = (rawActId: string): StudioIPageState => {
  const lab = useLabStudio(rawActId);

  return {
    ...lab,
    title: lab.query.data?.act.name ?? STUDIO_I_FALLBACK_TITLE,
    origin: LAB_ORIGIN,
  };
};
