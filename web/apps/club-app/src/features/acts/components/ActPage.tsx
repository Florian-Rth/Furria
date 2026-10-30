import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { START_ORIGIN } from '@/features/session/app-sections';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { ACT_DENIED_MESSAGE } from '../act-page-copy';
import { useActPage } from '../hooks/use-act-page';
import type { ActPageSearch } from '../schemas';
import { ActPageBody } from './ActPageBody';
import { ActPageLoading } from './ActPageLoading';
import { ActPracticeBody } from './ActPracticeBody';
import { ActTrainingPageBody } from './ActTrainingPageBody';

interface ActPageProps {
  actId: string;
  search: ActPageSearch;
}

export const ActPage: FC<ActPageProps> = ({ actId, search }) => {
  const page = useActPage(actId, search);

  if (page.actId === null || isNotFoundError(page.query.error)) {
    return <ScreenNotFound />;
  }
  if (isForbiddenError(page.query.error)) {
    return (
      <AccessDeniedScreen title={page.title} origin={START_ORIGIN} message={ACT_DENIED_MESSAGE} />
    );
  }

  if (page.query.data === undefined) {
    return (
      <KkScreen kind="detail" title={page.title} origin={page.origin}>
        <ActPageLoading page={page} />
      </KkScreen>
    );
  }

  if (page.mode !== 'details') {
    const body =
      page.mode === 'training' ? (
        <ActTrainingPageBody page={page} />
      ) : (
        <ActPracticeBody page={page} />
      );

    return (
      <KkScreen
        kind="fullscreen"
        title={page.title}
        origin={page.origin}
        actions={page.practiceActions}
      >
        {body}
      </KkScreen>
    );
  }

  return (
    <KkScreen kind="detail" title={page.title} origin={page.origin} actions={page.actions}>
      <ActPageBody page={page} />
    </KkScreen>
  );
};
