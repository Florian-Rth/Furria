import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { KEY_EDITOR_HELP_COPY, KEY_EDITOR_HELP_SPOTS } from '../keys-help-copy';

interface KeyHoldingHelpProps {
  isReturning: boolean;
  hasChain: boolean;
}

export const KeyHoldingHelp: FC<KeyHoldingHelpProps> = ({ isReturning, hasChain }) => {
  const person = isReturning ? null : (
    <KkHelp.Hint>
      <KkHelp.Title>{KEY_EDITOR_HELP_COPY.person.title}</KkHelp.Title>
      <KkHelp.Text>{KEY_EDITOR_HELP_COPY.person.text}</KkHelp.Text>
      <ScreenHelpShow spot={KEY_EDITOR_HELP_SPOTS.person} />
    </KkHelp.Hint>
  );
  const chain = hasChain ? (
    <KkHelp.Hint>
      <KkHelp.Title>{KEY_EDITOR_HELP_COPY.chain.title}</KkHelp.Title>
      <KkHelp.Text>{KEY_EDITOR_HELP_COPY.chain.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const date = isReturning ? (
    <KkHelp.Hint>
      <KkHelp.Title>{KEY_EDITOR_HELP_COPY.return.title}</KkHelp.Title>
      <KkHelp.Text>{KEY_EDITOR_HELP_COPY.return.text}</KkHelp.Text>
      <KkHelp.Text>{KEY_EDITOR_HELP_COPY.return.save}</KkHelp.Text>
      <ScreenHelpShow spot={KEY_EDITOR_HELP_SPOTS.return} />
    </KkHelp.Hint>
  ) : (
    <KkHelp.Hint>
      <KkHelp.Title>{KEY_EDITOR_HELP_COPY.handout.title}</KkHelp.Title>
      <KkHelp.Text>{KEY_EDITOR_HELP_COPY.handout.text}</KkHelp.Text>
      <KkHelp.Text>{KEY_EDITOR_HELP_COPY.handout.save}</KkHelp.Text>
      <ScreenHelpShow spot={KEY_EDITOR_HELP_SPOTS.handout} />
    </KkHelp.Hint>
  );

  return (
    <ScreenHelp>
      {person}
      {chain}
      {date}
    </ScreenHelp>
  );
};
