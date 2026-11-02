import { KkTouchLab } from '@furria/ui/KkTouchLab';
import type { FC } from 'react';
import type { StudioLabLoad } from '../hooks/use-studio-lab-page';
import type { StudioLabVariants } from '../schemas';
import type { StudioLabPlayground } from '../studio-lab';
import { STUDIO_LAB_EMPTY, STUDIO_LAB_LOADING, STUDIO_LAB_NO_ACT } from '../studio-lab-copy';
import { CentreTimelinePlayground } from './CentreTimelinePlayground';
import { ListsPlayground } from './ListsPlayground';
import { RailPlayground } from './RailPlayground';
import { StagePlayground } from './StagePlayground';
import { TimelinePlayground } from './TimelinePlayground';

interface StudioLabBodyProps {
  playground: StudioLabPlayground;
  load: StudioLabLoad;
  variants: StudioLabVariants;
}

const LOAD_TEXTS: Record<Exclude<StudioLabLoad['kind'], 'ready'>, string> = {
  loading: STUDIO_LAB_LOADING,
  noAct: STUDIO_LAB_NO_ACT,
  empty: STUDIO_LAB_EMPTY,
};

export const StudioLabBody: FC<StudioLabBodyProps> = ({ playground, load, variants }) => {
  if (load.kind !== 'ready') {
    return <KkTouchLab.Hint text={LOAD_TEXTS[load.kind]} />;
  }

  switch (playground) {
    case 'timeline':
      if (variants.scrub === 'centre') {
        return (
          <CentreTimelinePlayground key={load.actId} studio={load.studio} variants={variants} />
        );
      }
      return <TimelinePlayground key={load.actId} studio={load.studio} variants={variants} />;
    case 'stage':
      return <StagePlayground key={load.actId} studio={load.studio} variants={variants} />;
    case 'lists':
      return <ListsPlayground key={load.actId} studio={load.studio} />;
    case 'rail':
      return <RailPlayground key={load.actId} studio={load.studio} variants={variants} />;
  }
};
