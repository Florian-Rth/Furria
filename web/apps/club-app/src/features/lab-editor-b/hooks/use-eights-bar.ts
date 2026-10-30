import type { KkEightsSegmentState } from '@furria/ui/KkEightsBar';
import { useKkSheetCommands } from '@furria/ui/sheet-store';
import type { SheetDensity } from '../count-sheet';
import { SHEET_DENSITIES } from '../count-sheet';
import { progressLabelOf, progressTextOf } from '../eights-copy';
import { HISTORY_SHEET_ID, SETUP_SHEET_ID } from '../eights-sheets';
import type { EightsStudio } from './use-eights-studio';

export interface EightsBar {
  progressText: string;
  progressLabel: string;
  segments: KkEightsSegmentState[];
  chooseZoom: (key: string) => void;
  openSetup: () => void;
  openHistory: () => void;
  back: () => void;
  forward: () => void;
}

const isDensity = (key: string): key is SheetDensity =>
  SHEET_DENSITIES.some((density) => density === key);

export const useEightsBar = (eights: EightsStudio): EightsBar => {
  const sheets = useKkSheetCommands();
  const { progress, setDensity, screen } = eights;

  return {
    progressText: progressTextOf(progress.done, progress.total),
    progressLabel: progressLabelOf(progress.done, progress.total),
    segments: progress.items.map((item) => item.state),
    chooseZoom: (key) => {
      if (isDensity(key)) {
        setDensity(key);
      }
    },
    openSetup: () => {
      sheets.open(SETUP_SHEET_ID);
    },
    openHistory: () => {
      sheets.open(HISTORY_SHEET_ID);
    },
    back: () => {
      screen.practice.skip('back');
    },
    forward: () => {
      screen.practice.skip('forward');
    },
  };
};
