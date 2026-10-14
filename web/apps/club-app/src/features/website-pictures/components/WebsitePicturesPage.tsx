import { KkButton, KkErrorState, KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { AppListSkeleton, AREA_HANDOVERS, GALLERY_ORIGIN } from '@/features/session';
import { useWebsiteBoard } from '../hooks/use-website-board';
import {
  LOAD_ERROR_TITLE,
  LOADING_LABEL,
  RETRY_LABEL,
  toLoadErrorMessage,
  WEBSITE_LEAD,
  WEBSITE_TITLE,
} from '../website-copy';
import { WebsiteBoardBody } from './WebsiteBoardBody';

export const WebsitePicturesPage: FC = () => {
  const state = useWebsiteBoard();
  const errorMessage = toLoadErrorMessage(state.query.error);
  const retry = <KkButton onClick={state.reload}>{RETRY_LABEL}</KkButton>;
  const failure =
    errorMessage === null ? null : (
      <KkErrorState title={LOAD_ERROR_TITLE} description={errorMessage} action={retry} />
    );
  const content =
    state.board === null ? (
      (failure ?? <AppListSkeleton label={LOADING_LABEL} listShape="cards" />)
    ) : (
      <WebsiteBoardBody board={state.board} state={state} />
    );

  return (
    <KkScreen
      kind="working"
      title={WEBSITE_TITLE}
      origin={GALLERY_ORIGIN}
      header={<KkTitleHeader title={WEBSITE_TITLE} lead={WEBSITE_LEAD} />}
      handover={AREA_HANDOVERS.gallery}
    >
      {content}
    </KkScreen>
  );
};
