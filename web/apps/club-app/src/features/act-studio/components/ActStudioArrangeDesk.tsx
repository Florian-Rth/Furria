import { KkButton } from '@furria/ui/KkButton';
import { KkStudioDesk } from '@furria/ui/KkStudioDesk';
import type { FC } from 'react';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import {
  arrangeScopeOf,
  copySourceTextOf,
  STUDIO_ALIGN,
  STUDIO_ALIGN_COLUMN,
  STUDIO_ALIGN_ROW,
  STUDIO_ARRANGE_LABEL,
  STUDIO_COPY,
  STUDIO_COPY_APPLY,
  STUDIO_COPY_EARLIER,
  STUDIO_COPY_LATER,
  STUDIO_DISTRIBUTE,
  STUDIO_DISTRIBUTE_ACROSS,
  STUDIO_DISTRIBUTE_DEEP,
  STUDIO_NO_COPY_SOURCE,
  STUDIO_NUDGE_BACK,
  STUDIO_NUDGE_ON,
  STUDIO_PRESET_BLOCK,
  STUDIO_PRESET_CIRCLE,
  STUDIO_PRESET_LINE,
  STUDIO_PRESETS,
} from '../studio-copy';

interface ActStudioArrangeDeskProps {
  editor: ActStudioStage;
}

export const ActStudioArrangeDesk: FC<ActStudioArrangeDeskProps> = ({ editor }) => {
  const alignRow = (): void => {
    editor.align('across');
  };
  const alignColumn = (): void => {
    editor.align('deep');
  };
  const spreadAcross = (): void => {
    editor.distribute('across');
  };
  const spreadDeep = (): void => {
    editor.distribute('deep');
  };
  const line = (): void => {
    editor.preset('line');
  };
  const block = (): void => {
    editor.preset('block');
  };
  const circle = (): void => {
    editor.preset('circle');
  };
  const earlier = (): void => {
    editor.pickCopySource(-1);
  };
  const later = (): void => {
    editor.pickCopySource(1);
  };
  const scope = arrangeScopeOf(editor.selected.length);
  const noSteps = editor.copySteps === 0;
  const source = noSteps ? STUDIO_NO_COPY_SOURCE : copySourceTextOf(editor.copySource);
  const presetsTitle = `${STUDIO_PRESETS} · ${scope}`;
  const copyTitle = `${STUDIO_COPY} · ${scope}`;
  const alignLocked = !editor.canAlign;
  const spreadLocked = !editor.canDistribute;

  return (
    <KkStudioDesk label={STUDIO_ARRANGE_LABEL}>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={STUDIO_ALIGN} />
        <KkStudioDesk.Controls>
          <KkButton variant="outlined" size="small" disabled={alignLocked} onClick={alignRow}>
            {STUDIO_ALIGN_ROW}
          </KkButton>
          <KkButton variant="outlined" size="small" disabled={alignLocked} onClick={alignColumn}>
            {STUDIO_ALIGN_COLUMN}
          </KkButton>
        </KkStudioDesk.Controls>
      </KkStudioDesk.Line>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={STUDIO_DISTRIBUTE} />
        <KkStudioDesk.Controls>
          <KkButton variant="outlined" size="small" disabled={spreadLocked} onClick={spreadAcross}>
            {STUDIO_DISTRIBUTE_ACROSS}
          </KkButton>
          <KkButton variant="outlined" size="small" disabled={spreadLocked} onClick={spreadDeep}>
            {STUDIO_DISTRIBUTE_DEEP}
          </KkButton>
        </KkStudioDesk.Controls>
      </KkStudioDesk.Line>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={presetsTitle} />
        <KkStudioDesk.Controls>
          <KkButton variant="outlined" size="small" onClick={line}>
            {STUDIO_PRESET_LINE}
          </KkButton>
          <KkButton variant="outlined" size="small" onClick={block}>
            {STUDIO_PRESET_BLOCK}
          </KkButton>
          <KkButton variant="outlined" size="small" onClick={circle}>
            {STUDIO_PRESET_CIRCLE}
          </KkButton>
        </KkStudioDesk.Controls>
      </KkStudioDesk.Line>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={copyTitle} />
        <KkStudioDesk.Controls>
          <KkStudioDesk.Nudge
            text={STUDIO_NUDGE_BACK}
            label={STUDIO_COPY_EARLIER}
            disabled={noSteps}
            onPress={earlier}
          />
          <KkStudioDesk.Value text={source} />
          <KkStudioDesk.Nudge
            text={STUDIO_NUDGE_ON}
            label={STUDIO_COPY_LATER}
            disabled={noSteps}
            onPress={later}
          />
          <KkButton variant="outlined" size="small" disabled={noSteps} onClick={editor.copy}>
            {STUDIO_COPY_APPLY}
          </KkButton>
        </KkStudioDesk.Controls>
      </KkStudioDesk.Line>
    </KkStudioDesk>
  );
};
