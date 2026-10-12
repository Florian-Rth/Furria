import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkIconButton } from '../../../KkIconButton';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { filmstripWindowOf } from '../../viewer-steps';
import type { KkViewerStepDelta } from '../../viewer-types';
import { useViewer } from '../logic/viewer-context';
import { KkViewerFilmstripFrame } from './KkViewerFilmstripFrame';

const DEFAULT_REACH = 12;

interface KkViewerFilmstripProps {
  reach?: number;
  onSceneStep?: (delta: KkViewerStepDelta) => void;
  sx?: KkSx;
}

export const KkViewerFilmstrip: FC<KkViewerFilmstripProps> = ({
  reach = DEFAULT_REACH,
  onSceneStep,
  sx,
}) => {
  const viewer = useViewer();
  const { labels } = viewer;
  const span = filmstripWindowOf(viewer.index, viewer.items.length, reach);
  const frames = viewer.items.slice(span.start, span.end).map((item, offset) => {
    const index = span.start + offset;

    return (
      <KkViewerFilmstripFrame
        key={item.key}
        item={item}
        index={index}
        current={index === viewer.index}
        onShow={viewer.show}
      />
    );
  });

  const stepScene = (delta: KkViewerStepDelta) => (): void => {
    onSceneStep?.(delta);
  };
  const { previousScene: previousLabel, nextScene: nextLabel } = labels;
  const scenesShown = onSceneStep !== undefined;
  const previousScene =
    scenesShown && previousLabel !== undefined ? (
      <KkIconButton label={previousLabel} icon="back" size="small" onClick={stepScene(-1)} />
    ) : null;
  const nextScene =
    scenesShown && nextLabel !== undefined ? (
      <KkIconButton label={nextLabel} icon="chevron" size="small" onClick={stepScene(1)} />
    ) : null;

  return (
    <Stack
      direction="row"
      data-kk-viewer-filmstrip
      sx={[
        { alignItems: 'center', columnGap: 0.5, minWidth: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {previousScene}
      <Stack
        direction="row"
        sx={{
          flex: 1,
          minWidth: 0,
          columnGap: `${kkTokens.gallery.gutter}px`,
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {frames}
      </Stack>
      {nextScene}
    </Stack>
  );
};
