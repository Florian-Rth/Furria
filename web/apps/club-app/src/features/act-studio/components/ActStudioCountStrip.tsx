import { KkStudioCounts } from '@furria/ui/KkStudioCounts';
import type { FC } from 'react';
import { useActStudioCounts } from '../hooks/use-act-studio-counts';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { STUDIO_COUNTS_LABEL } from '../studio-copy';
import { ActStudioPlayheadLive } from './ActStudioPlayheadLive';

interface ActStudioCountStripProps {
  screen: StudioScreen;
  editor: ActStudioStage;
}

export const ActStudioCountStrip: FC<ActStudioCountStripProps> = ({ screen, editor }) => {
  const counts = useActStudioCounts(screen, editor);
  const eights = counts.eights.map((eight) => {
    const cells = eight.cells.map((cell) => (
      <KkStudioCounts.Cell
        key={cell.key}
        count={cell.count}
        inRange={cell.inRange}
        shown={cell.shown}
      />
    ));

    return (
      <KkStudioCounts.Eight key={eight.key} grow={eight.cells.length}>
        {cells}
      </KkStudioCounts.Eight>
    );
  });

  return (
    <KkStudioCounts label={STUDIO_COUNTS_LABEL}>
      <KkStudioCounts.Head>
        <KkStudioCounts.Text text={counts.text} accent={counts.accent} />
        <KkStudioCounts.Text text={counts.aside} accent={false} />
      </KkStudioCounts.Head>
      <KkStudioCounts.Track onPress={counts.press} onMove={counts.move} onEnd={counts.end}>
        {eights}
        <ActStudioPlayheadLive
          player={screen.playback.player}
          start={counts.span.start}
          end={counts.span.end}
        />
      </KkStudioCounts.Track>
    </KkStudioCounts>
  );
};
