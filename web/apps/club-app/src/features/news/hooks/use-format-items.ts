import type { KkFormatRailItem } from '@furria/ui/KkFormatRail';
import { BLOCK_WORDS, BOLD_WORD, LINK_WORD, MENTION_WORD } from '../editor-copy';
import type { NewsTextCommand } from '../news-text-editor';
import type { ProseText } from './use-prose-text';

export const useFormatItems = (text: ProseText, isReadOnly: boolean): KkFormatRailItem[] => {
  const { format } = text;
  const runOf =
    (command: NewsTextCommand): (() => void) =>
    () => {
      text.run(command);
    };

  return [
    {
      id: 'paragraph',
      icon: 'paragraph',
      label: BLOCK_WORDS.paragraph,
      pressed: format.block === 'paragraph',
      disabled: isReadOnly,
      onSelect: runOf({ kind: 'paragraph' }),
    },
    {
      id: 'heading',
      icon: 'heading',
      label: BLOCK_WORDS.heading,
      pressed: format.block === 'heading',
      disabled: isReadOnly,
      onSelect: runOf({ kind: 'heading' }),
    },
    {
      id: 'list',
      icon: 'list',
      label: BLOCK_WORDS.list,
      pressed: format.block === 'list',
      disabled: isReadOnly,
      onSelect: runOf({ kind: 'list' }),
    },
    {
      id: 'bold',
      icon: 'bold',
      label: BOLD_WORD,
      pressed: format.bold,
      disabled: isReadOnly,
      onSelect: runOf({ kind: 'bold' }),
    },
    {
      id: 'link',
      icon: 'link',
      label: LINK_WORD,
      pressed: format.link !== null,
      disabled: isReadOnly,
      onSelect: runOf({ kind: 'request-link' }),
    },
    {
      id: 'mention',
      icon: 'mention',
      label: MENTION_WORD,
      disabled: isReadOnly,
      onSelect: runOf({ kind: 'start-mention' }),
    },
  ];
};
