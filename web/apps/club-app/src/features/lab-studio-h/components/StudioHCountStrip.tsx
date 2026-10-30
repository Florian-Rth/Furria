import { KkStudioHCounts } from '@furria/ui/KkStudioHCounts';
import type { FC } from 'react';
import type { StudioH } from '../hooks/use-studio-h';
import { useStudioHCounts } from '../hooks/use-studio-h-counts';
import type { StudioHStage } from '../hooks/use-studio-h-stage';
import { STUDIO_H_COUNTS_LABEL } from '../studio-h-copy';
import { StudioHPlayheadLive } from './StudioHPlayheadLive';

interface StudioHCountStripProps {
  h: StudioH;
  editor: StudioHStage;
}

export const StudioHCountStrip: FC<StudioHCountStripProps> = ({ h, editor }) => {
  const counts = useStudioHCounts(h, editor);
  const eights = counts.eights.map((eight) => {
    const cells = eight.cells.map((cell) => (
      <KkStudioHCounts.Cell
        key={cell.key}
        count={cell.count}
        inRange={cell.inRange}
        shown={cell.shown}
      />
    ));

    return (
      <KkStudioHCounts.Eight key={eight.key} grow={eight.cells.length}>
        {cells}
      </KkStudioHCounts.Eight>
    );
  });

  return (
    <KkStudioHCounts label={STUDIO_H_COUNTS_LABEL}>
      <KkStudioHCounts.Head>
        <KkStudioHCounts.Text text={counts.text} accent={counts.accent} />
        <KkStudioHCounts.Text text={counts.aside} accent={false} />
      </KkStudioHCounts.Head>
      <KkStudioHCounts.Track onPress={counts.press} onMove={counts.move} onEnd={counts.end}>
        {eights}
        <StudioHPlayheadLive
          player={h.playback.player}
          start={counts.span.start}
          end={counts.span.end}
        />
      </KkStudioHCounts.Track>
    </KkStudioHCounts>
  );
};
