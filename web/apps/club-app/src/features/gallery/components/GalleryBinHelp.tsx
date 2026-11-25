import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { BIN_HELP_COPY, BIN_HELP_SPOTS } from '../bin-help-copy';
import { BinHelpItemsPreview } from './BinHelpItemsPreview';

export const GalleryBinHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{BIN_HELP_COPY.albums.title}</KkHelp.Title>
      <KkHelp.Text>{BIN_HELP_COPY.albums.text}</KkHelp.Text>
      <ScreenHelpShow spot={BIN_HELP_SPOTS.albums} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <BinHelpItemsPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{BIN_HELP_COPY.items.title}</KkHelp.Title>
      <KkHelp.Text>{BIN_HELP_COPY.items.text}</KkHelp.Text>
      <KkHelp.Text>{BIN_HELP_COPY.items.back}</KkHelp.Text>
      <ScreenHelpShow spot={BIN_HELP_SPOTS.items} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{BIN_HELP_COPY.countdown.title}</KkHelp.Title>
      <KkHelp.Text>{BIN_HELP_COPY.countdown.text}</KkHelp.Text>
      <KkHelp.Text>{BIN_HELP_COPY.countdown.inbox}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
