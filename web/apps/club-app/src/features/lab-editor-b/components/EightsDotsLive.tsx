import { KkEightsDot } from '@furria/ui/KkEightsDot';
import { KkStudioStage } from '@furria/ui/KkStudioStage';
import type { FC } from 'react';
import type { ActStudioStage } from '@/features/act-studio/hooks/use-act-studio-stage';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { STUDIO_BEND_LABEL } from '@/features/act-studio/studio-copy';
import { useEightsLiveDots } from '../hooks/use-eights-dots';

interface EightsDotsLiveProps {
  screen: StudioScreen;
  editor: ActStudioStage;
}

export const EightsDotsLive: FC<EightsDotsLiveProps> = ({ screen, editor }) => {
  const dots = useEightsLiveDots(screen, editor);
  const shown = dots.map((dot) => (
    <KkEightsDot
      key={dot.key}
      x={dot.x}
      y={dot.y}
      number={dot.number}
      name={dot.name}
      kind={dot.kind}
      selected={dot.selected}
      dimmed={dot.dimmed}
      gliding={false}
      tagSide={dot.tagSide}
      label={dot.label}
      onPress={dot.press}
      onMove={editor.move}
      onEnd={editor.end}
    />
  ));
  const handles = editor.movement.handles.map((handle) => {
    const press = (): void => {
      editor.movement.bendPress(handle.spotId);
    };

    return (
      <KkStudioStage.Handle
        key={handle.spotId}
        x={handle.x}
        y={handle.y}
        label={STUDIO_BEND_LABEL}
        onPress={press}
        onMove={editor.movement.bendMove}
        onEnd={editor.movement.bendEnd}
      />
    );
  });

  return (
    <>
      {shown}
      {handles}
    </>
  );
};
