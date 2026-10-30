import { KkEightsChip } from '@furria/ui/KkEightsChip';
import { KkEightsStrip } from '@furria/ui/KkEightsStrip';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  EIGHTS_MARK_HERE,
  EIGHTS_NAME_LABEL,
  EIGHTS_NAME_PLACEHOLDER,
  EIGHTS_REMOVE_STEP,
  EIGHTS_STAGE_TOOLS,
  EIGHTS_STRIP_LABEL,
} from '../eights-copy';
import { useEightsStageTools } from '../hooks/use-eights-stage-tools';
import { useEightsStrip } from '../hooks/use-eights-strip';
import type { EightsStudio } from '../hooks/use-eights-studio';
import { EightsChips } from './EightsChips';

interface EightsStepStripProps {
  eights: EightsStudio;
}

const NAME_LENGTH = 80;

export const EightsStepStrip: FC<EightsStepStripProps> = ({ eights }) => {
  const strip = useEightsStrip(eights);
  const tools = useEightsStageTools(eights);
  const chips = [...tools.modes, ...tools.chips];
  const stepRow = strip.editable ? (
    <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center', minWidth: 0 }}>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <KkEightsStrip.Name
          value={strip.name}
          label={EIGHTS_NAME_LABEL}
          placeholder={EIGHTS_NAME_PLACEHOLDER}
          maxLength={NAME_LENGTH}
          onChange={strip.setName}
          onCommit={strip.commitName}
        />
      </Stack>
      <KkEightsChip glyph="markStep" text={EIGHTS_MARK_HERE} pressed={null} onPress={strip.mark} />
      <KkEightsChip
        glyph="remove"
        text={EIGHTS_REMOVE_STEP}
        textHidden
        pressed={null}
        disabled={!strip.hasStep}
        onPress={strip.remove}
      />
    </Stack>
  ) : null;

  return (
    <KkEightsStrip label={EIGHTS_STRIP_LABEL}>
      <KkEightsStrip.Title
        eyebrow={strip.eyebrow}
        number={strip.number}
        title={strip.title}
        meta={strip.meta}
      />
      {stepRow}
      <EightsChips label={EIGHTS_STAGE_TOOLS} chips={chips} wrap />
    </KkEightsStrip>
  );
};
