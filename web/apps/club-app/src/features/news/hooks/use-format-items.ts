import type { KkFormatRailItem } from '@furria/ui';
import { BLOCK_WORDS, BOLD_WORD, LINK_WORD, MENTION_WORD } from '../editor-copy';
import { setParagraph, toggleBold, toggleHeading, toggleList } from '../text-commands';
import type { ProseText } from './use-prose-text';

export const useFormatItems = (text: ProseText, isReadOnly: boolean): KkFormatRailItem[] => {
  const { format } = text;

  return [
    {
      id: 'paragraph',
      icon: 'paragraph',
      label: BLOCK_WORDS.paragraph,
      pressed: format.block === 'paragraph',
      disabled: isReadOnly,
      onSelect: () => {
        text.run(setParagraph);
      },
    },
    {
      id: 'heading',
      icon: 'heading',
      label: BLOCK_WORDS.heading,
      pressed: format.block === 'heading',
      disabled: isReadOnly,
      onSelect: () => {
        text.run(toggleHeading);
      },
    },
    {
      id: 'list',
      icon: 'list',
      label: BLOCK_WORDS.list,
      pressed: format.block === 'list',
      disabled: isReadOnly,
      onSelect: () => {
        text.run(toggleList);
      },
    },
    {
      id: 'bold',
      icon: 'bold',
      label: BOLD_WORD,
      pressed: format.bold,
      disabled: isReadOnly,
      onSelect: () => {
        text.run(toggleBold);
      },
    },
    {
      id: 'link',
      icon: 'link',
      label: LINK_WORD,
      pressed: format.link !== null,
      disabled: isReadOnly,
      onSelect: text.requestLink,
    },
    {
      id: 'mention',
      icon: 'mention',
      label: MENTION_WORD,
      disabled: isReadOnly,
      onSelect: text.startMention,
    },
  ];
};
