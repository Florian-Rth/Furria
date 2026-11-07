import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { KkEjStageChip } from '@furria/ui/KkEjStageChip';
import { KkEjStageHead } from '@furria/ui/KkEjStageHead';
import { KkEjStageHint } from '@furria/ui/KkEjStageHint';
import type { FC } from 'react';
import type { EditJob, SelectionChip } from '../edit-jobs';
import { selectionChipOf } from '../edit-jobs';
import {
  chipAllOf,
  chipCountOf,
  chipSpotOf,
  EJ_CHIP_CLEAR,
  EJ_JOB_GLYPH,
  EJ_STAGE_HINT,
} from '../edit-jobs-copy';

interface EjStageHeadProps {
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

export const EjStageHead: FC<EjStageHeadProps> = ({ screen, editor, job, total }) => {
  const chosen = editor.selected.length;
  const chip = selectionChipOf(job, chosen, total);
  const clear = (): void => {
    editor.tap(null);
  };
  const single = screen.studio.spots.find((spot) => spot.spotId === editor.selected[0]);
  const chipText = chipTextOf(chip, chosen, single);
  const shown =
    chip === 'none' ? (
      <KkEjStageHint glyph={EJ_JOB_GLYPH[job]} text={EJ_STAGE_HINT[job]} />
    ) : (
      <KkEjStageChip text={chipText} clearLabel={EJ_CHIP_CLEAR} onClear={clear} />
    );

  return <KkEjStageHead>{shown}</KkEjStageHead>;
};
