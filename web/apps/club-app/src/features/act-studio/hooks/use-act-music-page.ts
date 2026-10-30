import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { UseQueryResult } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { ACT_FALLBACK_TITLE } from '@/features/acts/act-page-copy';
import { ACT_PAGE_PATH } from '@/features/acts/acts-origin';
import { useActStudioQuery } from '@/features/acts/api';
import type { ActStudioResponse } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import { useMeQuery } from '@/features/session/api';
import { parsePositiveId } from '@/lib/positive-id';
import type { ActMusicSearch, StudioMusicTool } from '../schemas';

const NO_CAST: readonly CastPerson[] = [];

export interface ActMusicPage {
  actId: number | null;
  query: UseQueryResult<ActStudioResponse, Error>;
  actName: string;
  origin: KkScreenOrigin;
  viewerId: number | null;
  canEdit: boolean;
  cast: readonly CastPerson[];
  tool: StudioMusicTool;
  chooseTool: (tool: StudioMusicTool) => void;
}

const editorSearchOf = (search: ActMusicSearch): Record<string, string> => {
  const kept = { ...search, tool: undefined, view: 'play', edit: true };

  return Object.fromEntries(
    Object.entries(kept).flatMap(([key, value]) =>
      value === undefined ? [] : [[key, String(value)]],
    ),
  );
};

export const useActMusicPage = (rawActId: string, search: ActMusicSearch): ActMusicPage => {
  const navigate = useNavigate();
  const actId = parsePositiveId(rawActId);
  const query = useActStudioQuery(actId);
  const me = useMeQuery();
  const act = query.data?.act ?? null;
  const actName = act?.name ?? ACT_FALLBACK_TITLE;

  return {
    actId,
    query,
    actName,
    origin: {
      label: actName,
      to: ACT_PAGE_PATH,
      params: { actId: rawActId },
      search: editorSearchOf(search),
    },
    viewerId: me.data?.person?.id ?? null,
    canEdit: query.data?.viewer.canEditStudio === true,
    cast: act?.cast ?? NO_CAST,
    tool: search.tool ?? 'music',
    chooseTool: (tool) => {
      void navigate({
        to: '.',
        search: (previous) => ({ ...previous, tool }),
        replace: true,
      });
    },
  };
};
