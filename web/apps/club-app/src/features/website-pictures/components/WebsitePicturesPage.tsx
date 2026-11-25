import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { AREA_HANDOVERS, GALLERY_ORIGIN } from '@/features/session/app-sections';
import { AppListSkeleton } from '@/features/session/components/AppListSkeleton';
import { useWebsiteBoard } from '../hooks/use-website-board';
import {
  LOAD_ERROR_TITLE,
  LOADING_LABEL,
  RETRY_LABEL,
  toLoadErrorMessage,
  WEBSITE_TITLE,
} from '../website-copy';
import { WebsiteBoardBody } from './WebsiteBoardBody';
import { WebsitePicturesHelp } from './WebsitePicturesHelp';

export const WebsitePicturesPage: FC = () => {
  const state = useWebsiteBoard();
  const errorMessage = toLoadErrorMessage(state.query.error);
  const retry = (
    <KkButton loading={state.query.isFetching} onClick={state.reload}>
      {RETRY_LABEL}
    </KkButton>
  );
  const hasOrphans = state.board !== null && state.board.orphans.length > 0;
  const help = toScreenHelp(<WebsitePicturesHelp hasOrphans={hasOrphans} />);
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
      header={<KkTitleHeader title={WEBSITE_TITLE} />}
      help={help}
      handover={AREA_HANDOVERS.gallery}
    >
      {content}
    </KkScreen>
  );
};
