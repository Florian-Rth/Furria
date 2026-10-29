import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import { useLabStudio } from '@/features/lab-studio/hooks/use-lab-studio';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isNotFoundError } from '@/lib/query-error';
import { STUDIO_C_TITLE_FALLBACK } from '../studio-c-copy';
import { StudioCBody } from './StudioCBody';

interface StudioCPageProps {
  actId: string;
}

export const StudioCPage: FC<StudioCPageProps> = ({ actId }) => {
  const lab = useLabStudio(actId);

  if (lab.actId === null || isNotFoundError(lab.query.error)) {
    return <ScreenNotFound />;
  }

  const title = lab.query.data?.act.name ?? STUDIO_C_TITLE_FALLBACK;

  return (
    <KkScreen kind="detail" title={title} origin={LAB_ORIGIN}>
      <StudioCBody lab={lab} />
    </KkScreen>
  );
};
