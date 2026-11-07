import { MUSIC_PAGE_DENIED, MUSIC_PAGE_TITLE } from '@furria/studio/step-cards-copy';
import type { StudioMusicTool } from '@furria/studio/studio-schemas';
import type { FC } from 'react';
import type { ActScreenSearch } from '@/features/acts/schemas';
import { useActMusicPage } from '../hooks/use-act-music-page';
import { useStudioVisit } from '../hooks/use-studio-visit';
import { ActMusicBody } from './ActMusicBody';
import { ActStudioPageGate } from './ActStudioPageGate';

interface ActMusicPageProps {
  actId: string;
  tool: StudioMusicTool;
  search: ActScreenSearch;
}

export const ActMusicPage: FC<ActMusicPageProps> = ({ actId, tool, search }) => {
  const page = useActMusicPage(actId, tool, search);
  useStudioVisit(page.actId);
  const studio = page.query.data?.studio ?? null;
  const body =
    page.actId === null || studio === null ? null : (
      <ActMusicBody page={page} actId={page.actId} studio={studio} />
    );

  return (
    <ActStudioPageGate
      page={page}
      title={MUSIC_PAGE_TITLE}
      heading={MUSIC_PAGE_TITLE}
      deniedTitle={MUSIC_PAGE_TITLE}
      deniedMessage={MUSIC_PAGE_DENIED}
    >
      {body}
    </ActStudioPageGate>
  );
};
