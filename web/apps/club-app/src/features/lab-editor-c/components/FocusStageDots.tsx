import { KkFocusDot } from '@furria/ui/KkFocusDot';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import { studioDotsAt } from '@/features/act-studio/studio-dots';
import type { StageShare } from '@/features/act-studio/studio-edits';
import { dotNameOf } from '../focus-copy';
import { nameSidesOf } from '../focus-names';
import type { FocusEditor } from '../hooks/use-focus-editor';

interface FocusStageDotsProps {
  editor: FocusEditor;
}

export const FocusStageDots: FC<FocusStageDotsProps> = ({ editor }) => {
  const { stage, screen, glide } = editor;
  const seconds = usePlaybackSeconds(screen.playback.player);
  const names = new Map(
    screen.studio.spots.map((spot) => [
      spot.spotId,
      dotNameOf(spot.number, spot.person?.firstName ?? null),
    ]),
  );
  const placed = studioDotsAt(stage.scene, seconds, stage.selected, !stage.formation);
  const sides = nameSidesOf(placed, stage.selected);
  const dots = placed.map((dot) => {
    const name = names.get(dot.spotId) ?? '';
    const nameSide = sides.get(dot.spotId) ?? 'below';
    const press = (share: StageShare): void => {
      editor.calm();
      stage.press(dot.spotId, share);
    };
    const nudge = (delta: StageShare): void => {
      editor.calm();
      const from = { x: dot.x, y: dot.y };
      stage.press(dot.spotId, from);
      stage.move({ x: from.x + delta.x, y: from.y + delta.y });
      stage.end();
    };

    return (
      <KkFocusDot
        key={dot.spotId}
        x={dot.x}
        y={dot.y}
        number={dot.number}
        name={name}
        nameSide={nameSide}
        kind={dot.kind}
        selected={dot.selected}
        dimmed={dot.dimmed}
        gliding={glide}
        turn={dot.turn}
        label={dot.label}
        onPress={press}
        onMove={stage.move}
        onEnd={stage.end}
        onNudge={nudge}
      />
    );
  });

  return <>{dots}</>;
};
