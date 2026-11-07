import {
  chipAllOf,
  chipCountOf,
  chipSpotOf,
  JOB_CHIP_CLEAR,
  JOB_GLYPH,
  JOB_STAGE_HINT,
} from '@furria/studio/job-copy';
import type { EditJob, SelectionChip } from '@furria/studio/job-model';
import { selectionChipOf } from '@furria/studio/job-model';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { KkSelectionChip } from '@furria/ui/KkSelectionChip';
import { KkStageHead } from '@furria/ui/KkStageHead';
import { KkStageHint } from '@furria/ui/KkStageHint';
import type { FC } from 'react';

interface JobStageHeadProps {
  screen: StudioScreen;
  editor: ActStudioStage;
  job: EditJob;
  total: number;
}

const chipTextOf = (
  chip: SelectionChip,
  chosen: number,
  single: { number: number; person: { firstName: string } | null } | undefined,
): string => {
  if (chip === 'all') {
    return chipAllOf(chosen);
  }

  return chip === 'spot' && single !== undefined
    ? chipSpotOf(single.number, single.person?.firstName ?? null)
    : chipCountOf(chosen);
};

export const JobStageHead: FC<JobStageHeadProps> = ({ screen, editor, job, total }) => {
  const chosen = editor.selected.length;
  const chip = selectionChipOf(job, chosen, total);
  const clear = (): void => {
    editor.tap(null);
  };
  const single = screen.studio.spots.find((spot) => spot.spotId === editor.selected[0]);
  const chipText = chipTextOf(chip, chosen, single);
  const shown =
    chip === 'none' ? (
      <KkStageHint glyph={JOB_GLYPH[job]} text={JOB_STAGE_HINT[job]} />
    ) : (
      <KkSelectionChip text={chipText} clearLabel={JOB_CHIP_CLEAR} onClear={clear} />
    );

  return <KkStageHead>{shown}</KkStageHead>;
};
