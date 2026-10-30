import { KkStudioHStage } from '@furria/ui/KkStudioHStage';
import { KkStudioHToolbar } from '@furria/ui/KkStudioHToolbar';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { StudioH } from '../hooks/use-studio-h';
import { useStudioHRoutes } from '../hooks/use-studio-h-routes';
import type { StudioHStage } from '../hooks/use-studio-h-stage';
import {
  STUDIO_H_FRONT,
  STUDIO_H_MIRROR,
  STUDIO_H_MULTI,
  STUDIO_H_ONION,
  STUDIO_H_SELECTION_OPEN,
  STUDIO_H_STAGE_LABEL,
  STUDIO_H_TOOLBAR_LABEL,
} from '../studio-h-copy';
import { StudioHStageScene } from './StudioHStageScene';

interface StudioHStageEditorProps {
  h: StudioH;
  editor: StudioHStage;
}

export const StudioHStageEditor: FC<StudioHStageEditorProps> = ({ h, editor }) => {
  const { stage } = h.playback;
  const routes = useStudioHRoutes(h, editor);
  const aspect = stage.depthMetres / stage.widthMetres;
  const paths = routes.map((route) => (
    <KkStudioHStage.Path key={route.key} route={route.route} keys={route.keys} aspect={aspect} />
  ));
  const formationTools = editor.formation ? (
    <>
      <KkStudioHToolbar.Toggle
        glyph="mirror"
        text={STUDIO_H_MIRROR}
        pressed={null}
        disabled={!editor.canMirror}
        onPress={editor.mirror}
      />
      <KkStudioHToolbar.Toggle
        glyph="onion"
        text={STUDIO_H_ONION}
        pressed={editor.onion}
        onPress={editor.toggleOnion}
      />
    </>
  ) : null;

  return (
    <Stack sx={{ position: 'absolute', inset: 0, minHeight: 0 }}>
      <KkStudioHToolbar label={STUDIO_H_TOOLBAR_LABEL}>
        <KkStudioHToolbar.Toggle
          glyph="multi"
          text={STUDIO_H_MULTI}
          pressed={editor.multi}
          onPress={editor.toggleMulti}
        />
        {formationTools}
        <KkStudioHToolbar.Selection
          text={editor.selectionText}
          label={STUDIO_H_SELECTION_OPEN}
          empty={editor.selected.length === 0}
          onPress={editor.openSheet}
        />
      </KkStudioHToolbar>
      <KkStudioHStage
        label={STUDIO_H_STAGE_LABEL}
        frontLabel={STUDIO_H_FRONT}
        widthMetres={stage.widthMetres}
        depthMetres={stage.depthMetres}
        artworkSvg={stage.artworkSvg}
        onClear={editor.clear}
      >
        <KkStudioHStage.Onion points={editor.onionPoints} />
        {paths}
        <StudioHStageScene h={h} editor={editor} />
      </KkStudioHStage>
    </Stack>
  );
};
