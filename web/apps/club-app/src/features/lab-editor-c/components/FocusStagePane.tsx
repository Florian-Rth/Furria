import { KkFocusLayout } from '@furria/ui/KkFocusLayout';
import { KkFocusSetup } from '@furria/ui/KkFocusSetup';
import { KkStudioStage } from '@furria/ui/KkStudioStage';
import type { FC } from 'react';
import { useActStudioRoutes } from '@/features/act-studio/hooks/use-act-studio-routes';
import { FOCUS_FRONT, FOCUS_STAGE_LABEL } from '../focus-copy';
import type { FocusEditor } from '../hooks/use-focus-editor';
import { FocusStageDots } from './FocusStageDots';

interface FocusStagePaneProps {
  editor: FocusEditor;
}

export const FocusStagePane: FC<FocusStagePaneProps> = ({ editor }) => {
  const { screen, stage, setup } = editor;
  const { stage: size } = screen.playback;
  const routes = useActStudioRoutes(screen, stage);
  const aspect = size.depthMetres / size.widthMetres;
  const paths = routes.map((route) => (
    <KkStudioStage.Path key={route.key} route={route.route} keys={route.keys} aspect={aspect} />
  ));
  const pending = setup.actionOf('spots') ?? setup.actionOf('formation');
  const pendingState = pending?.state === 'next' ? 'next' : 'later';
  const hint =
    pending === null ? null : (
      <KkFocusLayout.Center>
        <KkFocusSetup
          number={pending.number}
          text={pending.text}
          hint={pending.hint}
          state={pendingState}
          onPress={pending.run}
        />
      </KkFocusLayout.Center>
    );

  return (
    <>
      <KkStudioStage
        label={FOCUS_STAGE_LABEL}
        frontLabel={FOCUS_FRONT}
        widthMetres={size.widthMetres}
        depthMetres={size.depthMetres}
        artworkSvg={size.artworkSvg}
        onClear={stage.clear}
      >
        <KkStudioStage.Onion points={stage.onionPoints} />
        {paths}
        <FocusStageDots editor={editor} />
      </KkStudioStage>
      {hint}
    </>
  );
};
