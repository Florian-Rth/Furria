import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import {
  FEE_REDUCTION_HELP_COPY,
  FEE_REDUCTION_HELP_SPOTS,
} from '../person-fee-reduction-help-copy';
import { FeeReductionHelpBasisPreview } from './FeeReductionHelpBasisPreview';

interface PersonFeeReductionHelpProps {
  isEditing: boolean;
}

export const PersonFeeReductionHelp: FC<PersonFeeReductionHelpProps> = ({ isEditing }) => {
  const saving = isEditing
    ? FEE_REDUCTION_HELP_COPY.save.edit
    : FEE_REDUCTION_HELP_COPY.save.create;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <FeeReductionHelpBasisPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{FEE_REDUCTION_HELP_COPY.basis.title}</KkHelp.Title>
        <KkHelp.Text>{FEE_REDUCTION_HELP_COPY.basis.text}</KkHelp.Text>
        <ScreenHelpShow spot={FEE_REDUCTION_HELP_SPOTS.basis} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{FEE_REDUCTION_HELP_COPY.span.title}</KkHelp.Title>
        <KkHelp.Text>{FEE_REDUCTION_HELP_COPY.span.text}</KkHelp.Text>
        <KkHelp.Text>{FEE_REDUCTION_HELP_COPY.span.chain}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{FEE_REDUCTION_HELP_COPY.save.title}</KkHelp.Title>
        <KkHelp.Text>{saving}</KkHelp.Text>
        <KkHelp.Text>{FEE_REDUCTION_HELP_COPY.save.leave}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
