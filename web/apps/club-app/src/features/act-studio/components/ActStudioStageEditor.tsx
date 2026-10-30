import { KkStudioStage } from '@furria/ui/KkStudioStage';
import { KkStudioToolbar } from '@furria/ui/KkStudioToolbar';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useActStudioRoutes } from '../hooks/use-act-studio-routes';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import type { StudioScreen } from '../hooks/use-studio-screen';
import {
  STUDIO_FRONT,
  STUDIO_MIRROR,
  STUDIO_MULTI,
  STUDIO_ONION,
  STUDIO_SELECTION_OPEN,
  STUDIO_STAGE_LABEL,
  STUDIO_TOOLBAR_LABEL,
} from '../studio-copy';
import { ActStudioStageScene } from './ActStudioStageScene';

interface ActStudioStageEditorProps {
  screen: StudioScreen;
  editor: ActStudioStage;
}

export const ActStudioStageEditor: FC<ActStudioStageEditorProps> = ({ screen, editor }) => {
  const { stage } = screen.playback;
  const routes = useActStudioRoutes(screen, editor);
  const aspect = stage.depthMetres / stage.widthMetres;
  const paths = routes.map((route) => (
    <KkStudioStage.Path key={route.key} route={route.route} keys={route.keys} aspect={aspect} />
  ));
  const formationTools = editor.formation ? (
    <>
      <KkStudioToolbar.Toggle
        glyph="mirror"
        text={STUDIO_MIRROR}
        pressed={null}
        disabled={!editor.canMirror}
        onPress={editor.mirror}
      />
      <KkStudioToolbar.Toggle
        glyph="onion"
        text={STUDIO_ONION}
        pressed={editor.onion}
        onPress={editor.toggleOnion}
      />
    </>
  ) : null;

  return (
    <Stack sx={{ position: 'absolute', inset: 0, minHeight: 0 }}>
      <KkStudioToolbar label={STUDIO_TOOLBAR_LABEL}>
        <KkStudioToolbar.Toggle
          glyph="multi"
          text={STUDIO_MULTI}
          pressed={editor.multi}
          onPress={editor.toggleMulti}
        />
        {formationTools}
        <KkStudioToolbar.Selection
          text={editor.selectionText}
          label={STUDIO_SELECTION_OPEN}
          empty={editor.selected.length === 0}
          onPress={editor.openSheet}
        />
      </KkStudioToolbar>
      <KkStudioStage
        label={STUDIO_STAGE_LABEL}
        frontLabel={STUDIO_FRONT}
        widthMetres={stage.widthMetres}
        depthMetres={stage.depthMetres}
        artworkSvg={stage.artworkSvg}
        onClear={editor.clear}
      >
        <KkStudioStage.Onion points={editor.onionPoints} />
        {paths}
        <ActStudioStageScene screen={screen} editor={editor} />
      </KkStudioStage>
    </Stack>
  );
};
