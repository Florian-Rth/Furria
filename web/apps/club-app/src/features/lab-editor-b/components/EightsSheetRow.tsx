import { KkEightsSheet } from '@furria/ui/KkEightsSheet';
import type { FC } from 'react';
import type { EightsRowView } from '../hooks/use-eights-sheet';

interface EightsSheetRowProps {
  row: EightsRowView;
  onSeek: (seconds: number) => void;
}

export const EightsSheetRow: FC<EightsSheetRowProps> = ({ row, onSeek }) => {
  const cells = row.cells.map((cell) => (
    <KkEightsSheet.Count
      key={cell.key}
      column={cell.column}
      count={cell.count}
      seconds={cell.seconds}
      label={cell.label}
      numbered={cell.numbered}
      wave={cell.wave}
      tone={cell.tone}
      keyed={cell.keyed}
      partEdge={cell.partEdge}
      edge={cell.edge}
      onSeek={onSeek}
    />
  ));

  return (
    <KkEightsSheet.Row
      index={row.index}
      seconds={row.seconds}
      label={row.label}
      partStart={row.partStart}
    >
      <KkEightsSheet.Part
        name={row.part.name}
        continues={row.part.continues}
        current={row.part.current}
        grip={row.part.grip}
      />
      <KkEightsSheet.Label
        lane="step"
        lead={row.step.lead}
        text={row.step.text}
        continues={row.step.continues}
        current={row.step.current}
      />
      <KkEightsSheet.Counts>{cells}</KkEightsSheet.Counts>
      <KkEightsSheet.Label
        lane="video"
        lead={row.video.lead}
        text={row.video.text}
        continues={row.video.continues}
        current={row.video.current}
      />
      <KkEightsSheet.Label
        lane="ways"
        lead={row.ways.lead}
        text={row.ways.text}
        continues={row.ways.continues}
        current={row.ways.current}
      />
    </KkEightsSheet.Row>
  );
};
