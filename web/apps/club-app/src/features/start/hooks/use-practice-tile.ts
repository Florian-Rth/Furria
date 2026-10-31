import type { KkStartTileReach } from '@furria/ui/reach';
import { useKkSheetCommands } from '@furria/ui/sheet-store';
import { Link } from '@tanstack/react-router';
import type { MyAct } from '@/features/acts/schemas';
import { practiceReachOf, practiceTargetOf, toPracticeMeta } from '../practice-tile';
import type { StartPracticePanel } from '../schemas';
import { START_PRACTICE_SHEET } from '../start-sheets';

export interface PracticeLine {
  key: number;
  title: string;
  meta: string | undefined;
  reach: KkStartTileReach;
}

export interface PracticeTileView {
  reach: KkStartTileReach;
  lines: PracticeLine[];
  further: PracticeFurther | null;
}

export interface PracticeFurther {
  label: string;
  open: () => void;
}

const CHOOSER_LABEL = 'Auftritt zum Üben wählen';

const reachOf = (act: MyAct): KkStartTileReach => ({
  label: `${act.name} üben`,
  component: Link,
  ...practiceTargetOf(act),
});

export const usePracticeTile = (panel: StartPracticePanel): PracticeTileView => {
  const sheet = useKkSheetCommands();
  const shown = panel.acts.slice(0, panel.shownCount);
  const reach = practiceReachOf(panel.acts);
  const hidden = panel.acts.length - shown.length;

  const openChooser = (): void => {
    sheet.open(START_PRACTICE_SHEET);
  };

  return {
    reach:
      reach.kind === 'act' ? reachOf(reach.act) : { label: CHOOSER_LABEL, onClick: openChooser },
    lines: shown.map((act) => ({
      key: act.actId,
      title: act.name,
      meta: toPracticeMeta(act),
      reach: reachOf(act),
    })),
    further: hidden > 0 ? { label: `+${hidden} weitere`, open: openChooser } : null,
  };
};
