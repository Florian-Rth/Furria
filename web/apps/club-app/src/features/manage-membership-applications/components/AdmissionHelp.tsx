import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { ADMISSION_HELP_COPY, ADMISSION_HELP_SPOTS } from '../applications-help-copy';
import { AdmissionHelpChoicePreview } from './AdmissionHelpChoicePreview';

interface AdmissionHelpProps {
  hasCandidates: boolean;
}

export const AdmissionHelp: FC<AdmissionHelpProps> = ({ hasCandidates }) => {
  const candidates = hasCandidates ? (
    <KkHelp.Hint>
      <KkHelp.Preview>
        <AdmissionHelpChoicePreview />
      </KkHelp.Preview>
      <KkHelp.Title>{ADMISSION_HELP_COPY.candidates.title}</KkHelp.Title>
      <KkHelp.Text>{ADMISSION_HELP_COPY.candidates.text}</KkHelp.Text>
      <KkHelp.Text>{ADMISSION_HELP_COPY.candidates.fill}</KkHelp.Text>
      <ScreenHelpShow spot={ADMISSION_HELP_SPOTS.candidates} />
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      {candidates}
      <KkHelp.Hint>
        <KkHelp.Title>{ADMISSION_HELP_COPY.date.title}</KkHelp.Title>
        <KkHelp.Text>{ADMISSION_HELP_COPY.date.text}</KkHelp.Text>
        <KkHelp.Text>{ADMISSION_HELP_COPY.date.minor}</KkHelp.Text>
        <ScreenHelpShow spot={ADMISSION_HELP_SPOTS.admission} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{ADMISSION_HELP_COPY.save.title}</KkHelp.Title>
        <KkHelp.Text>{ADMISSION_HELP_COPY.save.text}</KkHelp.Text>
        <KkHelp.Text>{ADMISSION_HELP_COPY.save.gone}</KkHelp.Text>
        <KkHelp.Text>{ADMISSION_HELP_COPY.save.leave}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
