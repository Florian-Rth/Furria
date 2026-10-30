import { KkLaneChecklist } from '@furria/ui/KkLaneChecklist';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { LaneEditor } from '../hooks/use-lane-editor';
import { useLaneSetupRows } from '../hooks/use-lane-setup-rows';
import { LANE_CHECKLIST, LANE_SONG_ACCEPT, LANE_VIDEO_ACCEPT, progressTextOf } from '../lane-copy';

interface LaneSetupListProps {
  lane: LaneEditor;
  onLeave: () => void;
}

export const LaneSetupList: FC<LaneSetupListProps> = ({ lane, onLeave }) => {
  const { rows, songs, videos } = useLaneSetupRows(lane, onLeave);
  const aside = progressTextOf(lane.setup.done, lane.setup.total);
  const items = rows.map((row) => (
    <KkLaneChecklist.Row
      key={row.key}
      index={row.index}
      state={row.state}
      stateText={row.stateText}
      glyph={row.glyph}
      title={row.title}
      fact={row.fact}
      actionText={row.actionText}
      onAction={row.act}
    />
  ));

  return (
    <>
      <KkLaneChecklist title={LANE_CHECKLIST} aside={aside}>
        {items}
      </KkLaneChecklist>
      <Box
        component="input"
        type="file"
        accept={LANE_SONG_ACCEPT}
        multiple
        ref={songs.fileInput}
        onChange={songs.onChosen}
        hidden
      />
      <Box
        component="input"
        type="file"
        accept={LANE_VIDEO_ACCEPT}
        multiple
        ref={videos.fileInput}
        onChange={videos.onChosen}
        hidden
      />
    </>
  );
};
