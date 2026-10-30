import { KkStudioICounts } from '@furria/ui/KkStudioICounts';
import type { FC } from 'react';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { StudioICountsView as CountsModel } from '../hooks/use-studio-i-counts';
import { STUDIO_I_COUNTS_LABEL } from '../studio-i-copy';
import { StudioIPlayheadLive } from './StudioIPlayheadLive';

interface StudioICountsViewProps {
  counts: CountsModel;
  player: MixPlayer;
  length: number;
}

export const StudioICountsView: FC<StudioICountsViewProps> = ({ counts, player, length }) => {
  const window =
    counts.span === null
      ? { start: 0, end: length }
      : { start: counts.span.start, end: counts.span.end };
  const band = counts.band.map((piece) => (
    <KkStudioICounts.Lane
      key={piece.label}
      from={piece.from}
      to={piece.to}
      text={piece.text}
      label={piece.label}
      selected={piece.selected}
      onPress={piece.press}
    />
  ));
  const lane =
    counts.lane === null ? (
      <KkStudioICounts.Empty text={counts.empty} />
    ) : (
      <KkStudioICounts.Lane
        from={counts.lane.from}
        to={counts.lane.to}
        text={counts.lane.text}
        label={counts.lane.label}
        selected={counts.lane.selected}
        onPress={counts.lane.press}
        onDragStart={counts.lane.dragStart}
      />
    );
  const shown = counts.span === null ? band : lane;

  return (
    <KkStudioICounts label={STUDIO_I_COUNTS_LABEL}>
      <KkStudioICounts.Ruler cells={counts.cells} numbers={counts.numbers} />
      {shown}
      <StudioIPlayheadLive player={player} window={window} />
    </KkStudioICounts>
  );
};
