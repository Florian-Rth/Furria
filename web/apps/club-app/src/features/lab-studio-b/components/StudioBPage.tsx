import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { useLabStudio } from '@/features/lab-studio/hooks/use-lab-studio';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isNotFoundError } from '@/lib/query-error';
import { STUDIO_B_FALLBACK_TITLE, STUDIO_B_ORIGIN } from '../studio-b-copy';
import { StudioBBody } from './StudioBBody';

interface StudioBPageProps {
  actId: string;
}

export const StudioBPage: FC<StudioBPageProps> = ({ actId }) => {
  const { actId: parsedId, query, viewerId } = useLabStudio(actId);

  if (parsedId === null || isNotFoundError(query.error)) {
    return <ScreenNotFound />;
  }

  const title = query.data?.act.name ?? STUDIO_B_FALLBACK_TITLE;

  return (
    <KkScreen kind="detail" title={title} origin={STUDIO_B_ORIGIN}>
      <StudioBBody query={query} viewerId={viewerId} />
    </KkScreen>
  );
};
