import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { useStudioVisit } from '@/features/act-studio/hooks/use-studio-visit';
import { ActPageLoading } from '@/features/acts/components/ActPageLoading';
import { useActPage } from '@/features/acts/hooks/use-act-page';
import type { ActPageSearch } from '@/features/acts/schemas';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isNotFoundError } from '@/lib/query-error';
import { EditJobsBody } from './EditJobsBody';

interface EditJobsLabPageProps {
  actId: string;
  evening: number | undefined;
}

export const EditJobsLabPage: FC<EditJobsLabPageProps> = ({ actId, evening }) => {
  const search: ActPageSearch = { view: 'play', edit: true, evening };
  const page = useActPage(actId, search);
  useStudioVisit(page.actId);

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }

  const body =
    page.query.data === undefined ? <ActPageLoading page={page} /> : <EditJobsBody page={page} />;

  return (
    <KkScreen kind="fullscreen" title={page.title} origin={page.origin}>
      {body}
    </KkScreen>
  );
};
