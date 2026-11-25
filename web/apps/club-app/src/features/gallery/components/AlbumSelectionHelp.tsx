import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { SELECTION_HELP_COPY, SELECTION_HELP_SPOTS } from '../album-selection-help-copy';
import { SelectionHelpShowcasePreview } from './SelectionHelpShowcasePreview';

export const AlbumSelectionHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <SelectionHelpShowcasePreview />
      </KkHelp.Preview>
      <KkHelp.Title>{SELECTION_HELP_COPY.add.title}</KkHelp.Title>
      <KkHelp.Text>{SELECTION_HELP_COPY.add.text}</KkHelp.Text>
      <ScreenHelpShow spot={SELECTION_HELP_SPOTS.showcase} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{SELECTION_HELP_COPY.arrange.title}</KkHelp.Title>
      <KkHelp.Text>{SELECTION_HELP_COPY.arrange.text}</KkHelp.Text>
      <KkHelp.Text>{SELECTION_HELP_COPY.arrange.cover}</KkHelp.Text>
      <KkHelp.Text>{SELECTION_HELP_COPY.arrange.remove}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{SELECTION_HELP_COPY.publish.title}</KkHelp.Title>
      <KkHelp.Text>{SELECTION_HELP_COPY.publish.text}</KkHelp.Text>
      <KkHelp.Text>{SELECTION_HELP_COPY.publish.withdraw}</KkHelp.Text>
      <KkHelp.Text>{SELECTION_HELP_COPY.publish.session}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
