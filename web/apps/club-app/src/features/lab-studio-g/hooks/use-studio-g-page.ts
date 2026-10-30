import type { KkQuietScreenAction, KkScreenOrigin } from '@furria/ui/screen-declaration';
import { useState } from 'react';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import type { LabStudio } from '@/features/lab-studio/hooks/use-lab-studio';
import { useLabStudio } from '@/features/lab-studio/hooks/use-lab-studio';
import { STUDIO_G_DONE, STUDIO_G_EDIT, STUDIO_G_FALLBACK_TITLE } from '../studio-g-copy';

export type StudioGMode = 'practice' | 'edit';

export interface StudioGPage extends LabStudio {
  title: string;
  origin: KkScreenOrigin;
  mode: StudioGMode;
  actions: readonly [KkQuietScreenAction] | undefined;
}

export const useStudioGPage = (rawActId: string): StudioGPage => {
  const lab = useLabStudio(rawActId);
  const [wanted, setWanted] = useState<StudioGMode>('practice');
  const data = lab.query.data;
  const canEdit = data !== undefined && data.studio !== null && data.viewer.canEditStudio;
  const mode: StudioGMode = canEdit ? wanted : 'practice';

  const editAction: KkQuietScreenAction = {
    id: 'edit',
    label: STUDIO_G_EDIT,
    icon: 'edit',
    onSelect: () => {
      setWanted('edit');
    },
  };
  const doneAction: KkQuietScreenAction = {
    id: 'done',
    label: STUDIO_G_DONE,
    icon: 'check',
    onSelect: () => {
      setWanted('practice');
    },
  };
  const action = mode === 'edit' ? doneAction : editAction;

  return {
    ...lab,
    title: data?.act.name ?? STUDIO_G_FALLBACK_TITLE,
    origin: LAB_ORIGIN,
    mode,
    actions: canEdit ? [action] : undefined,
  };
};
