import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { KEYS_HELP_COPY, KEYS_HELP_SPOTS } from '../keys-help-copy';
import { KeysHelpHolderPreview } from './KeysHelpHolderPreview';

export const KeysHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{KEYS_HELP_COPY.venue.title}</KkHelp.Title>
      <KkHelp.Text>{KEYS_HELP_COPY.venue.text}</KkHelp.Text>
      <KkHelp.Text>{KEYS_HELP_COPY.venue.handout}</KkHelp.Text>
      <ScreenHelpShow spot={KEYS_HELP_SPOTS.venue} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <KeysHelpHolderPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{KEYS_HELP_COPY.takeBack.title}</KkHelp.Title>
      <KkHelp.Text>{KEYS_HELP_COPY.takeBack.text}</KkHelp.Text>
      <KkHelp.Text>{KEYS_HELP_COPY.takeBack.tap}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{KEYS_HELP_COPY.history.title}</KkHelp.Title>
      <KkHelp.Text>{KEYS_HELP_COPY.history.text}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{KEYS_HELP_COPY.archived.title}</KkHelp.Title>
      <KkHelp.Text>{KEYS_HELP_COPY.archived.text}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
