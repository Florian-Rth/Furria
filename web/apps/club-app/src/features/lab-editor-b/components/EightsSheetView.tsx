import { KkEightsSheet } from '@furria/ui/KkEightsSheet';
import type { FC } from 'react';
import {
  EIGHTS_NO_COUNTS,
  EIGHTS_PART,
  EIGHTS_SHEET_LABEL,
  EIGHTS_STEP,
  EIGHTS_VIDEO,
  EIGHTS_WAYS,
} from '../eights-copy';
import { useEightsSheet } from '../hooks/use-eights-sheet';
import type { EightsStudio } from '../hooks/use-eights-studio';
import { EightsCursorLive } from './EightsCursorLive';
import { EightsSheetRow } from './EightsSheetRow';

interface EightsSheetViewProps {
  eights: EightsStudio;
}

export const EightsSheetView: FC<EightsSheetViewProps> = ({ eights }) => {
  const sheet = useEightsSheet(eights);
  const { player } = eights.screen.playback;
  const rows = sheet.rows.map((row) => (
    <EightsSheetRow key={row.key} row={row} onSeek={sheet.seek} />
  ));
  const empty = sheet.rows.length === 0 ? <KkEightsSheet.Empty text={EIGHTS_NO_COUNTS} /> : null;

  return (
    <KkEightsSheet label={EIGHTS_SHEET_LABEL} density={eights.density} columns={sheet.columns}>
      <KkEightsSheet.Head
        part={EIGHTS_PART}
        step={EIGHTS_STEP}
        video={EIGHTS_VIDEO}
        ways={EIGHTS_WAYS}
        columns={sheet.columns}
      />
      {rows}
      {empty}
      <EightsCursorLive
        player={player}
        rows={sheet.spans}
        columns={sheet.columns}
        playing={eights.screen.practice.playing}
      />
    </KkEightsSheet>
  );
};
