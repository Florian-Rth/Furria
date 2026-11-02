import { useNavigate } from '@tanstack/react-router';
import { useActStudioQuery, useMyActsQuery } from '@/features/acts/api';
import type { Studio } from '@/features/acts/schemas';
import type { StudioLabSearch, StudioLabVariants } from '../schemas';
import { studioLabVariantsOf } from '../schemas';
import { labActIdOf } from '../studio-lab';

export type StudioLabLoad =
  | { kind: 'loading' }
  | { kind: 'noAct' }
  | { kind: 'empty' }
  | { kind: 'ready'; actId: number; studio: Studio };

export interface StudioLabPageModel {
  load: StudioLabLoad;
  variants: StudioLabVariants;
  choose: (patch: Partial<StudioLabSearch>) => void;
}

export const useStudioLabPage = (search: StudioLabSearch): StudioLabPageModel => {
  const acts = useMyActsQuery();
  const actId = acts.data === undefined ? null : labActIdOf(acts.data.acts, search.act);
  const studio = useActStudioQuery(actId);
  const navigate = useNavigate({ from: '/lab/studio/$playground' });
  const loaded = studio.data?.studio ?? null;
  const load: StudioLabLoad =
    acts.data === undefined || (actId !== null && studio.data === undefined)
      ? { kind: 'loading' }
      : actId === null
        ? { kind: 'noAct' }
        : loaded === null || loaded.songs.length + loaded.finalTracks.length === 0
          ? { kind: 'empty' }
          : { kind: 'ready', actId, studio: loaded };

  return {
    load,
    variants: studioLabVariantsOf(search),
    choose: (patch) => {
      void navigate({ search: (previous) => ({ ...previous, ...patch }), replace: true });
    },
  };
};
