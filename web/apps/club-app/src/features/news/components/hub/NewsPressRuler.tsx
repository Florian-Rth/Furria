import { KkPressRuler } from '@furria/ui/KkPressRuler';
import type { KkPressRulerLabels } from '@furria/ui/press-ruler-data';
import type { FC } from 'react';
import { sessionYearsLabelOf } from '@/lib/club';
import {
  PLAN_LABEL,
  RULER_NO_POSTS,
  RULER_TODAY,
  rulerLaneOf,
  rulerMoreOf,
  rulerPostsOf,
} from '../../hub-copy';
import type { PressRulerView } from '../../press-ruler';
import { rulerAxisOf, rulerLanesOf, rulerLegendOf } from './hub-lines';

const LABELS: KkPressRulerLabels = {
  today: RULER_TODAY,
  laneOf: (lane) => rulerLaneOf(sessionYearsLabelOf(Number(lane.key)), lane.count),
  marksOf: rulerPostsOf,
  noMarks: RULER_NO_POSTS,
  moreOf: rulerMoreOf,
};

interface NewsPressRulerProps {
  ruler: PressRulerView;
  onReveal: (postId: string) => void;
  onSection: (sessionKey: string) => void;
}

export const NewsPressRuler: FC<NewsPressRulerProps> = ({ ruler, onReveal, onSection }) => {
  const lanes = rulerLanesOf(ruler);
  const axis = rulerAxisOf(ruler);
  const legend = rulerLegendOf(ruler);

  return (
    <KkPressRuler
      label={PLAN_LABEL}
      lanes={lanes}
      axis={axis}
      today={ruler.today}
      draftCount={ruler.draftCount}
      legend={legend}
      labels={LABELS}
      onReveal={onReveal}
      onSection={onSection}
    />
  );
};
