import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { useStudioVisit } from '@/features/act-studio/hooks/use-studio-visit';
import { ActPageLoading } from '@/features/acts/components/ActPageLoading';
import { useActPage } from '@/features/acts/hooks/use-act-page';
import type { ActPageSearch } from '@/features/acts/schemas';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isNotFoundError } from '@/lib/query-error';
import { StepSetupBody } from './StepSetupBody';

interface StepSetupLabPageProps {
  actId: string;
}

const SEARCH: ActPageSearch = { view: 'play', edit: true, evening: undefined };

export const StepSetupLabPage: FC<StepSetupLabPageProps> = ({ actId }) => {
  const page = useActPage(actId, SEARCH);
  useStudioVisit(page.actId);

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }

  const body =
    page.query.data === undefined ? <ActPageLoading page={page} /> : <StepSetupBody page={page} />;

  return (
    <KkScreen kind="fullscreen" title={page.title} origin={page.origin}>
      {body}
    </KkScreen>
  );
};
