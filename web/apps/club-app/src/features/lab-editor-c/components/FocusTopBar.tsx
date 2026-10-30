import { KkFocusTop } from '@furria/ui/KkFocusTop';
import type { FC } from 'react';
import {
  FOCUS_FORMATION,
  FOCUS_HISTORY_GROUP,
  FOCUS_NEXT,
  FOCUS_PATHS,
  FOCUS_PAUSE,
  FOCUS_PLAY,
  FOCUS_PREVIOUS,
  FOCUS_REDO,
  FOCUS_TOOLBAR,
  FOCUS_TRANSPORT,
  FOCUS_UNDO,
  FOCUS_VIEW,
  FOCUS_ZOOM_IN,
  FOCUS_ZOOM_OUT,
} from '../focus-copy';
import type { FocusEditor } from '../hooks/use-focus-editor';
import { FocusClock } from './FocusClock';
import { FocusHistoryPop } from './FocusHistoryPop';
import { FocusSetupPop } from './FocusSetupPop';

interface FocusTopBarProps {
  editor: FocusEditor;
}

export const FocusTopBar: FC<FocusTopBarProps> = ({ editor }) => {
  const { screen, view, history, desk } = editor;
  const { practice, playback } = screen;
  const playing = playback.state.playing;
  const playLabel = playing ? FOCUS_PAUSE : FOCUS_PLAY;
  const formationOn = editor.tool === 'formation';
  const pathsOn = editor.tool === 'movement';
  const phoneText = !desk;
  const cannotPlay = !practice.canPlay || playback.length <= 0;
  const cannotStep = !practice.canStep;
  const cannotZoomOut = !view.canZoomOut;
  const cannotZoomIn = !view.canZoomIn;
  const cannotRedo = !history.canRedo;
  const cannotUndo = !history.canUndo;
  const previous = (): void => {
    editor.skip(-1);
  };
  const next = (): void => {
    editor.skip(1);
  };
  const formation = (): void => {
    editor.chooseTool('formation');
  };
  const paths = (): void => {
    editor.chooseTool('movement');
  };
  const zoom = desk ? (
    <KkFocusTop.Group label={FOCUS_VIEW} divided>
      <KkFocusTop.Button
        glyph="zoomOut"
        text={FOCUS_ZOOM_OUT}
        quietText
        disabled={cannotZoomOut}
        onPress={view.zoomOut}
      />
      <KkFocusTop.Button
        glyph="zoomIn"
        text={FOCUS_ZOOM_IN}
        quietText
        disabled={cannotZoomIn}
        onPress={view.zoomIn}
      />
    </KkFocusTop.Group>
  ) : null;
  const historyGroup = desk ? (
    <KkFocusTop.Group label={FOCUS_HISTORY_GROUP} divided>
      <KkFocusTop.Button
        glyph="undo"
        text={FOCUS_UNDO}
        quietText
        disabled={cannotUndo}
        onPress={history.undo}
      />
      <KkFocusTop.Button
        glyph="redo"
        text={FOCUS_REDO}
        quietText
        disabled={cannotRedo}
        onPress={history.redo}
      />
      <FocusHistoryPop history={history} />
    </KkFocusTop.Group>
  ) : null;
  const stepping = desk ? (
    <>
      <KkFocusTop.Button
        glyph="previous"
        text={FOCUS_PREVIOUS}
        quietText
        disabled={cannotStep}
        onPress={previous}
      />
      <KkFocusTop.Button
        glyph="next"
        text={FOCUS_NEXT}
        quietText
        disabled={cannotStep}
        onPress={next}
      />
    </>
  ) : null;

  return (
    <KkFocusTop label={FOCUS_TOOLBAR}>
      <KkFocusTop.Group label={FOCUS_TRANSPORT}>
        <KkFocusTop.Play
          playing={playing}
          label={playLabel}
          disabled={cannotPlay}
          onPress={playback.controls.toggle}
        />
        {stepping}
        <FocusClock editor={editor} />
      </KkFocusTop.Group>
      <KkFocusTop.Group label={FOCUS_VIEW} divided>
        <KkFocusTop.Button
          glyph="spots"
          text={FOCUS_FORMATION}
          pressed={formationOn}
          quietText={phoneText}
          onPress={formation}
        />
        <KkFocusTop.Button
          glyph="paths"
          text={FOCUS_PATHS}
          pressed={pathsOn}
          quietText={phoneText}
          onPress={paths}
        />
      </KkFocusTop.Group>
      {zoom}
      <KkFocusTop.Spacer />
      <FocusSetupPop setup={editor.setup} />
      {historyGroup}
    </KkFocusTop>
  );
};
